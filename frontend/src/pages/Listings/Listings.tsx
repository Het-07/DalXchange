"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ListingFilter from "../../components/ListingFilter/ListingFilter";
import ListingCard from "../../components/ListingCard/ListingCard";
import EditListingDialog from "../../components/EditListingDialog/EditListingDialog";
import { staticListings } from "../../data/staticListings";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Search, Plus, Filter } from "lucide-react";
import "./Listings.css";

// Base API URL from environment variables
const API_URL = import.meta.env.VITE_API_BASE_URL;

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  email: string;
  image: string;
  date?: string;
}

interface BackendListing {
  listing_id: string;
  title: string;
  description: string;
  category: string;
  price: string | number;
  posted_by: string;
  image_url: string;
}

const ITEMS_PER_PAGE = 12;

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Price: Low to High", value: "lowToHigh" },
  { label: "Price: High to Low", value: "highToLow" },
];

const Listings = () => {
  // Reference to prevent multiple fetches and track initialization
  const initialized = useRef(false);

  // State management
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState<string | null>(null);
  const [sortValue, setSortValue] = useState("newest");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  // Fetch listings from backend - defined as a memoized function to use in useEffect
  const fetchListingsFromBackend = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching listings from:", `${API_URL}/api/get-listings`);
      // Import our new API helper
      const { listingsApi } = await import("../../aws/apiHelper");
      // Get listings with proper authentication
      const data = await listingsApi.getListings();
      // Handle both array response and object with Items property
      const items = Array.isArray(data) ? data : data.Items || [];

      if (!Array.isArray(items)) {
        throw new Error("Expected array but got: " + JSON.stringify(items));
      }

      const dynamicListings: Listing[] = items.map((item: BackendListing) => ({
        id: item.listing_id,
        title: item.title,
        description: item.description,
        category: item.category,
        price:
          typeof item.price === "number" ? item.price.toString() : item.price,
        email: item.posted_by,
        image: item.image_url,
        date: new Date().toISOString(),
      }));

      // Load the cache of edited dynamic listings from localStorage
      const savedDynamicCache = localStorage.getItem("dynamicListingsCache");
      const dynamicCache = savedDynamicCache
        ? JSON.parse(savedDynamicCache)
        : [];

      // Merge fetched dynamic listings with the cache (cache takes precedence for edited listings)
      const mergedDynamicListings = dynamicListings.map((listing) => {
        const cachedListing = dynamicCache.find(
          (cached: Listing) => cached.id === listing.id
        );
        return cachedListing || listing;
      });

      // Only update localStorage if there are actual new listings
      if (dynamicListings.length > 0) {
        localStorage.setItem(
          "dynamicListingsCache",
          JSON.stringify(mergedDynamicListings)
        );
      }

      // Load static listings from localStorage
      const savedStatic = localStorage.getItem("staticListings");
      const staticList = savedStatic ? JSON.parse(savedStatic) : staticListings;

      // Update listings state with both dynamic and static listings
      setListings([...mergedDynamicListings, ...staticList]);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch listings");

      // Show error toast
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err instanceof Error ? err.message : "Failed to fetch listings",
        life: 5000,
      });

      // Fallback to static listings
      const savedStatic = localStorage.getItem("staticListings");
      const staticList = savedStatic ? JSON.parse(savedStatic) : staticListings;
      const savedDynamicCache = localStorage.getItem("dynamicListingsCache");
      const dynamicCache = savedDynamicCache
        ? JSON.parse(savedDynamicCache)
        : [];

      setListings([...dynamicCache, ...staticList]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]); // Only depends on isLoading state

  // Initialize listings from localStorage once on mount
  useEffect(() => {
    if (initialized.current) return;

    // Load initial listings from localStorage or fall back to static listings
    const savedStatic = localStorage.getItem("staticListings");
    const savedDynamicCache = localStorage.getItem("dynamicListingsCache");

    const initialStatic = savedStatic
      ? JSON.parse(savedStatic)
      : staticListings;
    const initialDynamicCache = savedDynamicCache
      ? JSON.parse(savedDynamicCache)
      : [];

    // Initialize the listings state
    setListings([...initialDynamicCache, ...initialStatic]);

    // Check if we need to fetch from backend
    const hasDynamicListings = initialDynamicCache.length > 0;
    if (!hasDynamicListings) {
      fetchListingsFromBackend();
    }

    initialized.current = true;
  }, [fetchListingsFromBackend]);

  // Memoize these functions to avoid unnecessary re-renders
  const handleDelete = useCallback(async (id: string) => {
    const isDynamic = !id.startsWith("static-");

    if (isDynamic) {
      try {
        // Import our new API helper
        const { listingsApi } = await import("../../aws/apiHelper");

        // Delete listing with proper authentication
        await listingsApi.deleteListing(id);

        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Listing deleted successfully",
          life: 3000,
        });
      } catch (err) {
        console.error("Delete error:", err);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            err instanceof Error ? err.message : "Failed to delete listing",
          life: 5000,
        });

        // Return early without updating state if delete failed
        return;
      }
    }

    // Filter out the deleted listing from the state
    setListings((prevListings) => {
      const updatedListings = prevListings.filter((item) => item.id !== id);

      // Separate static and dynamic listings
      const updatedStaticListings = updatedListings.filter((listing) =>
        listing.id.startsWith("static-")
      );
      const updatedDynamicListings = updatedListings.filter(
        (listing) => !listing.id.startsWith("static-")
      );

      // Update localStorage
      localStorage.setItem(
        "staticListings",
        JSON.stringify(updatedStaticListings)
      );
      localStorage.setItem(
        "dynamicListingsCache",
        JSON.stringify(updatedDynamicListings)
      );

      return updatedListings;
    });
  }, []);

  // Sorting function
  const sortListings = useCallback(
    (listings: Listing[], sortType: string): Listing[] => {
      const sorted = [...listings];
      switch (sortType) {
        case "newest":
          return sorted.sort(
            (a, b) =>
              (b.date ? new Date(b.date).getTime() : 0) -
              (a.date ? new Date(a.date).getTime() : 0)
          );
        case "oldest":
          return sorted.sort(
            (a, b) =>
              (a.date ? new Date(a.date).getTime() : 0) -
              (b.date ? new Date(b.date).getTime() : 0)
          );
        case "lowToHigh":
          return sorted.sort((a, b) => Number(a.price) - Number(b.price));
        case "highToLow":
          return sorted.sort((a, b) => Number(b.price) - Number(a.price));
        default:
          return sorted;
      }
    },
    []
  );

  // Apply filters and sorting
  const getFilteredListings = useCallback(() => {
    let filtered = [...listings];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((l) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price range filter
    if (priceRange.min || priceRange.max) {
      const minNum = Number(priceRange.min) || 0;
      const maxNum = Number(priceRange.max) || Number.POSITIVE_INFINITY;
      filtered = filtered.filter((l) => {
        const price = Number(l.price);
        return price >= minNum && price <= maxNum;
      });
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((l) =>
        selectedCategories.includes(l.category)
      );
    }

    // Apply sorting
    return sortListings(filtered, sortValue);
  }, [
    listings,
    searchQuery,
    priceRange,
    selectedCategories,
    sortValue,
    sortListings,
  ]);

  // Handlers for filters
  const handleSearch = useCallback(
    (query: string) => setSearchQuery(query),
    []
  );

  const handlePriceRange = useCallback(
    (min: string, max: string) => setPriceRange({ min, max }),
    []
  );

  const handleApplyFilters = useCallback(
    (categories: string[]) => setSelectedCategories(categories),
    []
  );

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setSelectedCategories([]);
  }, []);

  const handleEdit = useCallback((id: string) => {
    setEditId(id);
  }, []);

  const handleSaveEdit = useCallback(
    async (updated: Listing, isDynamic: boolean) => {
      if (isDynamic) {
        try {
          // Import our new API helper
          const { listingsApi } = await import("../../aws/apiHelper");

          // Update listing with proper authentication
          await listingsApi.updateListing(updated.id, {
            title: updated.title,
            description: updated.description,
            category: updated.category,
            price: Number(updated.price),
            posted_by: updated.email,
            image_url: updated.image,
          });

          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Listing updated successfully",
            life: 3000,
          });
        } catch (error) {
          console.error("Error updating listing:", error);
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail:
              error instanceof Error
                ? error.message
                : "Failed to update listing",
            life: 5000,
          });

          // Return early if update failed
          return;
        }
      }

      // Update the listings state
      setListings((prevListings) => {
        const updatedListings = prevListings.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item
        );

        // Separate static and dynamic listings
        const updatedStaticListings = updatedListings.filter((listing) =>
          listing.id.startsWith("static-")
        );
        const updatedDynamicListings = updatedListings.filter(
          (listing) => !listing.id.startsWith("static-")
        );

        // Update localStorage
        localStorage.setItem(
          "staticListings",
          JSON.stringify(updatedStaticListings)
        );

        if (isDynamic) {
          localStorage.setItem(
            "dynamicListingsCache",
            JSON.stringify(updatedDynamicListings)
          );
        }

        return updatedListings;
      });

      // Close edit dialog
      setEditId(null);
    },
    []
  );

  // Apply filters and pagination - only calculate these when dependencies change
  const filteredListings = getFilteredListings();
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredListings.length / ITEMS_PER_PAGE)
  );

  return (
    <div className="listings-page">
      <Toast ref={toast} />

      {/* Hero Section */}
      <div className="listings-hero">
        <div className="hero-content">
          <h1>Discover Campus Treasures</h1>
          <p>
            Browse through items from the Dalhousie community <br />
            or list your own items.
          </p>

          <div className="hero-search">
            <span className="p-input-icon-left">
              <Search className="search-icon" />
              <InputText
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for items..."
                className="hero-search-input"
              />
            </span>
            <Button
              label="Create Listing"
              icon={<Plus size={16} />}
              onClick={() => navigate("/create-listing")}
              className="hero-create-btn"
            />
          </div>
        </div>
      </div>

      <main className="listings-main">
        <div className="container">
          <div className="listings-header">
            <div className="listings-title">
              <h2>Browse Listings</h2>
              <span className="listings-count">
                {filteredListings.length} items found
              </span>
            </div>

            <div className="listings-controls">
              <Button
                icon={<Filter size={18} />}
                onClick={() => setMobileFiltersVisible(!mobileFiltersVisible)}
                className="filter-toggle-btn"
                aria-label="Toggle filters"
              />

              <Dropdown
                value={sortValue}
                options={sortOptions}
                onChange={(e) => setSortValue(e.value)}
                placeholder="Sort by"
                className="sort-dropdown"
              />

              <Button
                label="Create Listing"
                onClick={() => navigate("/create-listing")}
                className="create-btn"
              />
            </div>
          </div>

          <div className="listings-content">
            <aside
              className={`listings-filters ${
                mobileFiltersVisible ? "mobile-visible" : ""
              }`}
            >
              <ListingFilter
                onSearch={handleSearch}
                onPriceRangeChange={handlePriceRange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
              />
            </aside>

            <section className="listings-results">
              {isLoading ? (
                <div className="listings-loading">
                  <div className="loader"></div>
                  <p>Loading amazing listings...</p>
                </div>
              ) : error ? (
                <div className="error-message">
                  <p>Error: {error}</p>
                  <Button
                    label="Retry"
                    onClick={fetchListingsFromBackend}
                    className="retry-btn"
                  />
                </div>
              ) : paginatedListings.length > 0 ? (
                <div className="listings-grid">
                  {paginatedListings.map((item) => (
                    <div className="listing-card-wrapper" key={item.id}>
                      <ListingCard
                        {...item}
                        onEdit={() => handleEdit(item.id)}
                        onDelete={() => handleDelete(item.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <h3>No listings found</h3>
                </div>
              )}

              {totalPages > 1 && (
                <div className="listings-pagination">
                  <Button
                    icon="pi pi-angle-left"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className="pagination-btn"
                  />

                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={i + 1 === currentPage ? "active" : ""}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    icon="pi pi-angle-right"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className="pagination-btn"
                  />
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {editId && (
        <EditListingDialog
          open={true}
          onOpenChange={(open) => !open && setEditId(null)}
          listing={listings.find((l) => l.id === editId)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default Listings;
