"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import type { Listing } from "../../pages/Listings/Listings";
import "./EditListingDialog.css";

interface EditListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: Listing;
  onSave: (data: Listing, isDynamic: boolean) => void;
}

const categories = [
  { label: "Furniture", value: "Furniture" },
  { label: "Electronics", value: "Electronics" },
  { label: "Books", value: "Books" },
  { label: "Sports", value: "Sports" },
  { label: "Kitchen", value: "Kitchen" },
  { label: "Apparel", value: "Apparel" },
];

const EditListingDialog = ({
  open,
  onOpenChange,
  listing,
  onSave,
}: EditListingDialogProps) => {
  const [formData, setFormData] = useState<Listing>({
    id: "",
    title: "",
    description: "",
    category: "",
    price: "",
    email: "",
    image: "",
  });

  useEffect(() => {
    if (listing) setFormData(listing);
  }, [listing]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (e: { value: string }) => {
    setFormData((prev) => ({ ...prev, category: e.value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormData((prev) => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const isDynamic = !formData.id.startsWith("static-");

    // Get API URL from environment variables
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    if (isDynamic) {
      try {
        const response = await fetch(
          `${API_URL}/api/update-listing/${formData.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: formData.title,
              description: formData.description,
              category: formData.category,
              price: Number(formData.price),
              posted_by: formData.email,
              image_url: formData.image,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update listing: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error updating listing:", error);
        alert(
          "Failed to update listing in the backend. Changes will be saved locally."
        );
      }
    }

    onSave(formData, isDynamic);
    onOpenChange(false);
  };

  // Custom header with close button that matches the design
  const renderHeader = () => {
    return (
      <div className="dialog-header">
        <h2>Edit Listing</h2>
        <button
          className="close-button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="12" fill="#F0F0F0" />
            <path
              d="M16 8L8 16M8 8L16 16"
              stroke="#666"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    );
  };

  // Custom footer with Cancel and Save Changes buttons
  const renderFooter = () => {
    return (
      <div className="dialog-footer">
        <Button
          label="Cancel"
          className="cancel-button"
          onClick={() => onOpenChange(false)}
        />
        <Button
          label="Save Changes"
          className="save-button"
          onClick={handleSubmit}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={open}
      onHide={() => onOpenChange(false)}
      style={{ width: "600px", maxWidth: "95vw" }}
      modal
      className="edit-listing-dialog"
      showHeader={false}
      footer={renderFooter()}
    >
      {renderHeader()}
      <div className="dialog-content">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <InputText
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="p-inputtext p-component w-full"
          />
        </div>

        <div className="form-row">
          <div className="form-group category-group">
            <label htmlFor="category">Category</label>
            <div className="category-dropdown-container">
              <Dropdown
                id="category"
                value={formData.category}
                options={categories}
                onChange={handleDropdownChange}
                placeholder="Select a category"
                className="w-full"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="price">Price (CAD)</label>
            <InputText
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              type="number"
              className="w-full"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full"
          />
        </div>

        <div className="form-group">
          <label>Current Image</label>
          <div className="image-container">
            {formData.image && (
              <img
                src={formData.image || "/placeholder.svg"}
                alt="Listing"
                className="current-image"
              />
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="file-input-label" htmlFor="image-upload">
            Choose New Image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default EditListingDialog;
