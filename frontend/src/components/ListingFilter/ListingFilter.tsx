"use client";

import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Slider } from "primereact/slider";
import { X, SlidersHorizontal } from "lucide-react";
import "./ListingFilter.css";

interface ListingFilterProps {
  onSearch: (query: string) => void;
  onPriceRangeChange: (min: string, max: string) => void;
  onApply: (selectedCategories: string[]) => void;
  onReset: () => void;
}

const categoryOptions = [
  { label: "Furniture", value: "Furniture" },
  { label: "Electronics", value: "Electronics" },
  { label: "Books", value: "Books" },
  { label: "Sports", value: "Sports" },
  { label: "Kitchen", value: "Kitchen" },
  { label: "Apparel", value: "Apparel" },
];

const ListingFilter = ({
  onPriceRangeChange,
  onApply,
  onReset,
}: ListingFilterProps) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value)
        ? prev.filter((cat) => cat !== value)
        : [...prev, value]
    );
  };

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
    setMinPrice(value[0].toString());
    setMaxPrice(value[1].toString());
    onPriceRangeChange(value[0].toString(), value[1].toString());
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
    onReset();
  };

  return (
    <div className="listing-filter">
      <div className="filter-header">
        <h2 className="filter-heading">
          <SlidersHorizontal size={18} />
          <span>Filters</span>
        </h2>
        <button className="close-filters-btn" onClick={handleReset}>
          <X size={18} />
        </button>
      </div>

      <div className="filter-section">
        <label className="filter-label">Price Range (CAD)</label>
        <div className="price-slider">
          <Slider
            value={priceRange}
            onChange={(e) =>
              handlePriceRangeChange(e.value as [number, number])
            }
            range
            min={0}
            max={1000}
            step={10}
            className="price-range-slider"
          />
          <div className="price-range-values">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
        <div className="price-range">
          <InputText
            placeholder="Min"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              onPriceRangeChange(e.target.value, maxPrice);
            }}
          />
          <InputText
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              onPriceRangeChange(minPrice, e.target.value);
            }}
          />
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Categories</label>
        <div className="category-list">
          {categoryOptions.map((cat) => (
            <div key={cat.value} className="category-item">
              <Checkbox
                inputId={cat.value}
                checked={selectedCategories.includes(cat.value)}
                onChange={() => toggleCategory(cat.value)}
              />
              <label htmlFor={cat.value}>{cat.label}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="filter-actions">
        <Button
          label="Apply Filters"
          onClick={() => onApply(selectedCategories)}
          className="apply-btn"
        />
        <Button
          label="Reset"
          onClick={handleReset}
          className="reset-btn"
          severity="secondary"
        />
      </div>
    </div>
  );
};

export default ListingFilter;
