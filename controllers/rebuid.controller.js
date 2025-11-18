const gamme = require("../models/gamme");
const pattern = require("../models/pattern");
const rebuildService = require("../services/rebuildService");
const getPatternsSQL = require("../middleware/sqlQuery");
const rebuild = require("../models/rebuild");
const getProjetService = require("../services/getProjetService");
const net = require("net");

const zplToPrintPnQte = (text, qte, date) => {
  return `
        ^XA
        ^MD20
        ^PW525
        ^LL300
        ^FO90,40         
        ^BY2,5,3,5         
        ^BCN,72,N,N,N      
        ^FD${text}^FS
        ^FO116,130
        ^A0N,20,20
        ^FD${text} / ${qte} / ${date}^FS
        ^XZ
        `;
};
const zplToPrintBIN = (text) => {
  return `

^XA
^FO0,55
^A0N,100,100
^FB550,1,0,C,0
^FD${text}^FS

^XZ

        `;
};

function printZebra(zpl) {
  const PRINTER_IP = "10.50.68.70";
  const PRINTER_PORT = 9100;

  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.connect(PRINTER_PORT, PRINTER_IP, () => {
      client.write(zpl);
      client.end();
    });

    client.on("close", () => resolve("Printed successfully"));
    client.on("error", (err) => reject(err));
  });
}
const rebuildGamme = async (req, res) => {
  var dataRebuild = [];

  try {
    const gammeFromDB = await gamme.findAll();
    for (const element of gammeFromDB) {
      const stockData = await pattern.findAll({
        where: {
          id_gamme: element.id,
        },
        raw: true,
      });

      const patternData = await getPatternsSQL(element.partNumber);

      const resultFromRebuilService = await rebuildService(
        element.partNumber,
        patternData.recordset,
        stockData
      );
      let projet = await getProjetService(element.partNumber);

      let _pn = element.partNumber;
      dataRebuild.push({ _pn, resultFromRebuilService, projet });
    }
    dataRebuild.sort((a, b) => {
      return b.resultFromRebuilService.taux - a.resultFromRebuilService.taux;
    });
    const inCompeletedDataRebuild = dataRebuild.filter((item) => {
      return (
        item.resultFromRebuilService.taux < 100 &&
        item.resultFromRebuilService.taux > 0
      );
    });
    const compeletedDataRebuild = dataRebuild.filter((item) => {
      return item.resultFromRebuilService.taux == 100;
    });

    res.status(200).json({
      data: inCompeletedDataRebuild,
      compeletedDataRebuild,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error Calculating !!!." });
  }
};

const rebuildChangeStatus = async (req, res) => {
  const data = req.body;
  const currentDate = new Date();
  try {
    if (!data.statusRebuild) {
      res.status(400).json({
        message: "No status provided!!!",
      });
    }
    if (
      data.statusRebuild === "Préparation en cours" &&
      data.qteRequest >= 1 &&
      data.qte >= data.qteRequest
    ) {
      const gammeFromDB = await gamme.findOne({
        where: {
          partNumber: data.pn,
        },
      });
      const patternData = await getPatternsSQL(gammeFromDB.partNumber);

      const patternItemTest = await pattern.findAll({
        where: {
          quantite: 0,
          id_gamme: gammeFromDB.id,
        },
      });

      console.log("------------ QTE === 0 -------------");
      console.log(patternItemTest);

      if (patternItemTest.length === 0) {
        patternData.recordset.map(async (item) => {
          const patternItem = await pattern.findOne({
            where: {
              patternNumb: item.panel_number,
              id_gamme: gammeFromDB.id,
            },
          });

          console.log("-----------------------PATTERN----------------------");
          console.log(patternItem.patternNumb);

          if (patternItem?.quantite > 0) {
            await patternItem.decrement("quantite", {
              by: data.qteRequest * item.quantity,
            });
          }
        });

        let projet = await getProjetService(gammeFromDB.partNumber);
        await rebuild.create({
          pn: data.pn,
          qte: data.qteRequest,
          status_rebuild: data.statusRebuild,
          projet,
        });

        res.status(201).json({
          message: "Préparation en cours",
        });
      } else {
        res.status(400).json({
          message: "Erreur changement status: une demande deja initié",
        });
      }
    }
    if (data.statusRebuild === "Livrée") {
      await rebuild.update(
        {
          status_rebuild: data.statusRebuild,
          date_creation: currentDate.toISOString().slice(0, 10),
          heure_creation: currentDate.toTimeString().split(" ")[0],
        },
        {
          where: {
            id: data.id,
          },
        }
      );
      const rebuildFromDBToPrint = await rebuild.findByPk(data.id);

      await printZebra(
        zplToPrintPnQte(
          rebuildFromDBToPrint.pn,
          rebuildFromDBToPrint.qte,
          rebuildFromDBToPrint.date_creation
        )
      );
      res.status(201).json({
        message: "Coiffe livrée",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erreur de creation Change status!!!",
    });
  }
};

const annulerRebuild = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        message: "id not provided!!!",
      });
    }

    const rebuildFromDB = await rebuild.findByPk(id);

    if (!rebuildFromDB) {
      return res.status(404).json({
        message: "Gamme not found!!!",
      });
    }

    if (rebuildFromDB.status_rebuild === "Préparation en cours") {
      const patternData = await getPatternsSQL(rebuildFromDB.pn);
      patternData.recordset.map(async (item) => {
        const gammeFromDB = await gamme.findOne({
          where: {
            partNumber: rebuildFromDB.pn,
          },
        });
        const patternItem = await pattern.findOne({
          where: {
            patternNumb: item.panel_number,
            id_gamme: gammeFromDB.id,
          },
        });

        if (patternItem) {
          const res = await patternItem.increment("quantite", {
            by: rebuildFromDB.qte * item.quantity,
          });
        }
      });
      await rebuildFromDB.destroy();
      return res.status(200).json({
        message: "Coiffe annulée",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erreur annulation!!!",
    });
  }
};

const getRebuildPreparation = async (req, res) => {
  try {
    const getRebuildFromDB = await rebuild.findAll({
      where: {
        status_rebuild: "Préparation en cours",
      },
      order: [["id", "DESC"]],
    });

    res.status(200).json({
      data: getRebuildFromDB,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      data: error,
    });
  }
};

const getRebuildLivree = async (req, res) => {
  try {
    const getRebuildFromDB = await rebuild.findAll({
      where: { status_rebuild: "Livrée" },
      order: [["id", "DESC"]],
    });
    res.status(200).json({ data: getRebuildFromDB });
  } catch (error) {
    console.log(error);
  }
};

const testPrinter = async (req, res) => {
  try {
    await printZebra(zplToPrintBIN("A01-01"));
    res.status(200).json({
      data: "succes",
    });
  } catch (error) {
    res.status(500).json({
      data: error,
    });
  }
};
module.exports = {
  rebuildGamme,
  rebuildChangeStatus,
  annulerRebuild,
  getRebuildPreparation,
  getRebuildLivree,
  testPrinter,
};
