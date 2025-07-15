"use client";

import "./CreateListing.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { useForm, Controller } from "react-hook-form";
import campusImage from "../../assets/campus.png";
import { Toast } from "primereact/toast";
import { jwtDecode } from "jwt-decode";

type ListingFormData = {
  title: string;
  description: string;
  category: string;
  price: number;
  postedBy: string;
};

type JwtCustomPayload = {
  email?: string;
  [key: string]: unknown;
};

const categories = [
  { label: "Furniture", value: "Furniture" },
  { label: "Electronics", value: "Electronics" },
  { label: "Books", value: "Books" },
  { label: "Sports", value: "Sports" },
  { label: "Kitchen", value: "Kitchen" },
  { label: "Apparel", value: "Apparel" },
  { label: "Others", value: "Others" },
];

const decodeJWT = (token: string): JwtCustomPayload | null => {
  try {
    return jwtDecode<JwtCustomPayload>(token);
  } catch (err) {
    console.error("JWT Decode Error:", err);
    return null;
  }
};

export default function CreateListing() {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  // Updated email handling to only use JWT token
  useEffect(() => {
    const idToken = localStorage.getItem("id_token");
    if (idToken) {
      try {
        const decoded = decodeJWT(idToken);
        if (decoded?.email) {
          setUserEmail(decoded.email);
        } else {
          // If no email in token, redirect to login
          toast.current?.show({
            severity: "error",
            summary: "Authentication Error",
            detail: "Please login again to continue",
            life: 3000,
          });
          setTimeout(() => navigate("/auth/login"), 3000);
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        toast.current?.show({
          severity: "error",
          summary: "Authentication Error",
          detail: "Please login again to continue",
          life: 3000,
        });
        setTimeout(() => navigate("/auth/login"), 3000);
      }
    } else {
      // No token found, redirect to login
      navigate("/auth/login");
    }
  }, [navigate]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ListingFormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: 0,
      postedBy: userEmail,
    },
  });

  useEffect(() => {
    if (userEmail) {
      setValue("postedBy", userEmail);
    }
  }, [userEmail, setValue]);

  const onSubmit = async (data: ListingFormData) => {
    if (!file) {
      toast.current?.show({
        severity: "warn",
        summary: "Image Required",
        detail: "Please upload an image.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const base64Image = await convertFileToBase64(file);

      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        posted_by: userEmail, // Using the email from JWT token
        image_base64: base64Image.split(",")[1],
      };

      const { listingsApi } = await import("../../aws/apiHelper");
      const result = await listingsApi.addListing(payload);

      if (result.statusCode === 200) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Listing created successfully!",
        });

        setTimeout(() => {
          navigate("/listings");
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to create listing");
      }
    } catch (err) {
      console.error("Listing creation failed:", err);

      let errorMessage = "Failed to create listing";
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div
      className="create-page"
      style={{ backgroundImage: `url(${campusImage})` }}
    >
      <div className="create-overlay">
        <div className="create-grid">
          <div className="create-info">
            <h1>Create Your Listing</h1>
            <p>Sell or exchange items with the Dalhousie community.</p>
            <Button
              onClick={() => navigate(-1)}
              label="Back"
              icon={<ArrowLeft size={16} />}
              className="p-button-text back-btn"
            />
          </div>

          <div className="create-form-card">
            <form onSubmit={handleSubmit(onSubmit)} className="form">
              <div className="form-field">
                <label htmlFor="title">Title</label>
                <InputText
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  className={errors.title ? "p-invalid" : ""}
                  placeholder="Item Title"
                />
                {errors.title && (
                  <small className="p-error">{errors.title.message}</small>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="description">Description</label>
                <InputTextarea
                  id="description"
                  {...register("description", {
                    required: "Description is required",
                  })}
                  rows={4}
                  placeholder="Describe the item"
                  className={errors.description ? "p-invalid" : ""}
                />
                {errors.description && (
                  <small className="p-error">
                    {errors.description.message}
                  </small>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="category">Category</label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field, fieldState }) => (
                    <>
                      <Dropdown
                        id={field.name}
                        value={field.value}
                        onChange={(e) => field.onChange(e.value)}
                        options={categories}
                        placeholder="Select a category"
                        className={fieldState.invalid ? "p-invalid" : ""}
                      />
                      {fieldState.error && (
                        <small className="p-error">
                          {fieldState.error.message}
                        </small>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="form-field">
                <label htmlFor="price">Price (CAD)</label>
                <Controller
                  name="price"
                  control={control}
                  rules={{
                    required: "Price is required",
                    min: { value: 0, message: "Price must be positive" },
                  }}
                  render={({ field, fieldState }) => (
                    <>
                      <InputNumber
                        id={field.name}
                        value={field.value}
                        onValueChange={(e) => field.onChange(e.value ?? 0)}
                        mode="currency"
                        currency="CAD"
                        min={0}
                        locale="en-CA"
                        placeholder="0.00"
                        className={fieldState.invalid ? "p-invalid" : ""}
                      />
                      {fieldState.error && (
                        <small className="p-error">
                          {fieldState.error.message}
                        </small>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="form-field">
                <label>Upload Image</label>
                <FileUpload
                  mode="basic"
                  chooseLabel="Choose Image"
                  accept="image/*"
                  maxFileSize={1000000}
                  customUpload
                  auto={false}
                  uploadHandler={() => {
                    // we are not uploading to server yet
                  }}
                  onSelect={(e) => {
                    const uploaded = e.files?.[0];
                    if (uploaded) {
                      setFile(uploaded);
                      setUploadMessage(
                        `${uploaded.name} uploaded successfully`
                      );
                    }
                  }}
                />
                {uploadMessage && (
                  <small
                    style={{
                      color: "green",
                      marginTop: "0.5rem",
                      display: "block",
                      fontWeight: "500",
                    }}
                  >
                    {uploadMessage}
                  </small>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="postedBy">Dalhousie Email Id</label>
                <InputText
                  id="postedBy"
                  {...register("postedBy")}
                  value={userEmail}
                  disabled
                  className="disabled-input"
                />
                <small className="helper-text">
                  Listings are created under your account email
                </small>
              </div>

              <Button
                label={isSubmitting ? "Creating..." : "Create Listing"}
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              />
              <Toast ref={toast} position="top-right" />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
