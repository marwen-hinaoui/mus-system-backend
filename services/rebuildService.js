const rebuildService = async (pn, patternData, stockData) => {
  const results = patternData.map((p) => {
    const s = stockData.find((x) => x.patternNumb === p.panel_number);
    const pattern = s ? s.patternNumb : p.panel_number;

    const available = s ? s.quantite : 0;
    const possible = Math.floor(available / p.quantity);
    const missing = available < p.quantity ? p.quantity - available : 0;

    return {
      pattern: pattern,
      patternPN: p.pattern,
      quantity: p.quantity,
      available,
      possible,
      type: p.type,
      missing,
    };
  });

  const totalGammePossbile = Math.min(...results.map((r) => r.possible)); // ... separete each element in array to because min in js dont accept array its accpet only this format :min(1,2,3)
  const tauxArray = results.filter((r) => r.missing === 0);
  const taux = Math.floor((tauxArray.length / patternData.length) * 100);

  return {
    pn,
    results,
    totalGammePossbile,
    taux,
  };
};
module.exports = rebuildService;
