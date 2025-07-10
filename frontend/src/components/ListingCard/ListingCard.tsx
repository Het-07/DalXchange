"use client";

import type React from "react";
import "./ListingCard.css";
import { Calendar, Mail, Tag, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

type ListingCardProps = {
  title: string;
  description: string;
  price: string;
  category: string;
  image: string;
  email: string;
  date?: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

const ListingCard: React.FC<ListingCardProps> = ({
  title,
  description,
  price,
  category,
  image,
  email,
  date,
  onEdit,
  onDelete,
}) => {
  const [imageError, setImageError] = useState(false);

  const formattedDate = date
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date))
    : "";

  return (
    <div className="listing-card">
      {/* Badge for category */}
      <div className="listing-badge">{category}</div>

      {/* Image container with fixed aspect ratio */}
      <div className="listing-image-container">
        <img
          src={
            imageError
              ? "https://via.placeholder.com/300x200?text=No+Image"
              : image
          }
          alt={title}
          className="listing-image"
          onError={() => setImageError(true)}
        />
      </div>

      <div className="listing-content">
        {/* Price tag */}
        <div className="listing-price-tag">
          <Tag size={14} />
          <span>${price}</span>
        </div>

        {/* Title */}
        <h3 className="listing-title">{title}</h3>

        {/* Description */}
        <p className="listing-description">{description}</p>

        {/* Contact info and date */}
        <div className="listing-meta">
          <div className="listing-email" title={email}>
            <Mail size={14} />
            <span>{email}</span>
          </div>

          <div className="listing-date">
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="listing-actions">
          {onEdit && (
            <button className="edit-btn" onClick={onEdit} title="Edit listing">
              <Edit size={16} />
              <span>Edit</span>
            </button>
          )}

          {onDelete && (
            <button
              className="delete-btn"
              onClick={onDelete}
              title="Delete listing"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
