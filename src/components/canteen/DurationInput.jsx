import { useState } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';

const units = [
  { id: 1, name: 'Minutes', multiplier: 1 },
  { id: 2, name: 'Hours', multiplier: 60 },
];

export default function DurationInput({ label, onChange }) {
  const [amount, setAmount] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(units[0]);

  const convertAndNotifyParent = (newAmount, newUnit) => {
    const numericAmount = parseFloat(newAmount);
    if (!isNaN(numericAmount)) {
      onChange(Math.round(numericAmount * newUnit.multiplier));
    } else {
      onChange(0);
    }
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    convertAndNotifyParent(val, selectedUnit);
  };

  const handleUnitChange = (unit) => {
    setSelectedUnit(unit);
    convertAndNotifyParent(amount, unit);
  };

  return (
    <div className="w-full">
      <label className="text-lightestGrey mb-1 block text-sm font-bold">
        {label}
      </label>
      <div className="relative flex">
        <input
          type="number"
          min="0"
          value={amount}
          onChange={handleAmountChange}
          className="bg-dark border-grey text-lightestGrey focus:border-lightestGrey border p-2 focus:outline-none block w-full border-r-0 placeholder:text-gray-600"
          placeholder="e.g. 15"
        />

        <Listbox value={selectedUnit} onChange={handleUnitChange}>
          <div className="relative">
            <ListboxButton className="bg-dark border-grey text-lightestGrey focus:border-lightestGrey relative w-28 cursor-default border p-2 text-left focus:outline-none h-full">
              <span className="block truncate">{selectedUnit.name}</span>
            </ListboxButton>
            
              <ListboxOptions className="bg-dark border-grey absolute right-0 z-10 mt-1 max-h-60 w-full overflow-auto border py-1 text-base shadow-xl focus:outline-none sm:text-sm">
                {units.map((unit) => (
                  <ListboxOption
                    key={unit.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 px-4 ${
                        active ? 'bg-accent text-white' : 'text-lightestGrey'
                      }`
                    }
                    value={unit}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                          {unit.name}
                        </span>
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
          </div>
        </Listbox>
      </div>
    </div>
  );
}
