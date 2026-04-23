await createDrink(newDrink, DRINK_TYPES[newDrink.type]?.icon);
    setShowDrinkCreator(false);
    setNewDrink({ name: DRINK_TYPES[newDrink.type]?.label || 'Boisson', type: newDrink.type, abv: DRINK_TYPES[newDrink.type]?.defaultAbv || 5, defaultServingSize: 50 });
  };