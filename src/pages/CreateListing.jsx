
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Listing } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { geocodeAddress } from '@/api/functions';
import { Upload, X, GripVertical, DollarSign, Clock } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Section = ({ title, description, required = false, children }) => (
  <div className="py-8 border-b border-gray-200">
    <h2 className="text-xl font-semibold">
      {title}
      {required && <span className="text-red-500 ml-1">*</span>}
    </h2>
    <p className="text-gray-600 mt-1">{description}</p>
    <div className="mt-6">{children}</div>
  </div>
);

const AMENITY_OPTIONS = [
  'Water Slide',
  'Basketball Hoop',
  'Climbing Wall',
  'Obstacle Course',
  'Bounce Area',
  'Safety Net',
  'Themed Design',
  'Sound System',
  'LED Lights',
  'Multiple Slides',
  'Ball Pit',
  'Pop-up Obstacles'
];

export default function CreateListing() {
  const [listingData, setListingData] = useState({
    title: "",
    description: "",
    images: [],
    pricing_model: "daily",
    price_per_day: "",
    price_per_hour: "",
    location: { city: "", state: "", latitude: null, longitude: null },
    capacity: "",
    amenities: [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [listingId, setListingId] = useState(null);
  const [adminHostId, setAdminHostId] = useState(null);
  const [geocodeError, setGeocodeError] = useState(null); // Added state for geocode errors
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const hostId = params.get('host_id');

    if (hostId) {
        setAdminHostId(hostId);
    }
    
    if (id) {
        setEditMode(true);
        setListingId(id);
        const fetchListing = async () => {
            try {
                const existingListing = await Listing.get(id);
                setListingData({
                    title: existingListing.title || "",
                    description: existingListing.description || "",
                    images: existingListing.images || [],
                    pricing_model: existingListing.pricing_model || "daily",
                    price_per_day: String(existingListing.price_per_day || ""),
                    price_per_hour: String(existingListing.price_per_hour || ""),
                    location: existingListing.location || { city: "", state: "", latitude: null, longitude: null },
                    capacity: String(existingListing.capacity || ""),
                    amenities: existingListing.amenities || [],
                });
            } catch (error) {
                console.error("Failed to fetch listing for editing:", error);
                alert("Could not load listing data. Redirecting to dashboard.");
                navigate(createPageUrl('Dashboard'));
            }
        };
        fetchListing();
    }
  }, [location, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!listingData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!listingData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (listingData.images.length === 0) {
      newErrors.images = "At least one photo is required";
    }
    
    if (listingData.pricing_model === "daily" && (!listingData.price_per_day || parseFloat(listingData.price_per_day) <= 0)) {
      newErrors.price = "Valid daily price is required";
    }
    
    if (listingData.pricing_model === "hourly" && (!listingData.price_per_hour || parseFloat(listingData.price_per_hour) <= 0)) {
      newErrors.price = "Valid hourly price is required";
    }
    
    if (!listingData.location.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!listingData.location.state.trim()) {
      newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setListingData({ ...listingData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleNestedInputChange = (category, name, value) => {
    setListingData({
      ...listingData,
      [category]: {
        ...listingData[category],
        [name]: value,
      },
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls = [...listingData.images];
    
    for (const file of files) {
      try {
        const { file_url } = await UploadFile({ file });
        uploadedUrls.push(file_url);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("There was an error uploading an image. Please try again.");
      }
    }
    
    setListingData(prev => ({ ...prev, images: uploadedUrls }));
    
    // Clear images error if we now have images
    if (errors.images && uploadedUrls.length > 0) {
      setErrors({ ...errors, images: null });
    }
    
    setIsUploading(false);
  };
  
  const removeImage = (indexToRemove) => {
    setListingData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(listingData.images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setListingData({ ...listingData, images: items });
  };

  const handleAmenityChange = (amenity, checked) => {
    setListingData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeocodeError(null); // Reset geocode error on new submission
    
    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    
    // Geocode address to get latitude and longitude
    let coordinates = { latitude: null, longitude: null };
    let geocodingSuccess = false;
    try {
      const { data: coords } = await geocodeAddress({ 
          city: listingData.location.city, 
          state: listingData.location.state 
      });
      if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
          coordinates = {
              latitude: coords.latitude,
              longitude: coords.longitude
          };
          geocodingSuccess = true;
      }
    } catch (error) {
      console.warn("Geocoding failed, proceeding without coordinates:", error);
    }
    
    // Warn user if geocoding failed, but do so non-disruptively
    if (!geocodingSuccess) {
        setGeocodeError("Warning: Could not find coordinates for this location. The listing will be saved, but it may not appear correctly on the map. Please verify the city and state.");
    }
    
    try {
      const currentUser = !adminHostId ? await User.me() : null;
      const hostId = adminHostId || currentUser.id;
      
      const payload = { 
        ...listingData,
        host_id: hostId,
        location: {
            ...listingData.location,
            ...coordinates
        }
      };
      
      if (payload.pricing_model === 'daily') {
        payload.price_per_hour = null;
      } else {
        payload.price_per_day = null;
      }
      
      if(editMode) {
        await Listing.update(listingId, payload);
        alert("Listing updated successfully!");
        navigate(createPageUrl(`Listing?id=${listingId}`));
      } else {
        const newListing = await Listing.create(payload);
        alert("Listing created successfully!");
        navigate(createPageUrl(`Listing?id=${newListing.id}`));
      }
    } catch (error) {
      console.error("Error submitting listing:", error);
      alert("Failed to submit listing. Please check your inputs and try again.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">{editMode ? "Edit Your Bounce House" : "List Your Bounce House"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <Section title="Listing Title" description="Give your bounce house a catchy name that stands out." required>
          <Input 
            name="title" 
            value={listingData.title} 
            onChange={handleInputChange} 
            placeholder="e.g., The Ultimate Party Castle" 
            maxLength="50" 
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </Section>
        
        <Section title="Photos" description="Upload high-quality photos. The first image will be the main cover. Drag to reorder." required>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap gap-4 mb-4">
                  {listingData.images.map((url, index) => (
                    <Draggable key={`${url}-${index}`} draggableId={`${url}-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef} 
                          {...provided.draggableProps} 
                          className={`relative group w-32 h-32 ${snapshot.isDragging ? 'rotate-6 scale-105' : ''}`}
                        >
                          <div 
                            {...provided.dragHandleProps} 
                            className="absolute top-1 left-1 z-10 p-1 bg-white/70 rounded-full cursor-grab hover:bg-white/90"
                          >
                            <GripVertical size={16} />
                          </div>
                          <img 
                            src={url} 
                            alt={`preview ${index + 1}`} 
                            className="w-full h-full object-cover rounded-lg border-2 border-gray-200" 
                          />
                          <button 
                            type="button" 
                            onClick={() => removeImage(index)} 
                            className="absolute top-1 right-1 z-10 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Cover
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <label className={`w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${errors.images ? 'border-red-500' : 'border-gray-300'}`}>
                    <Upload size={24} className={errors.images ? "text-red-500" : "text-gray-500"} />
                    <span className={`text-sm mt-2 ${errors.images ? "text-red-500" : "text-gray-600"}`}>
                      {isUploading ? "Uploading..." : "Add Photos"}
                    </span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      disabled={isUploading} 
                    />
                  </label>
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
          {isUploading && <p className="text-blue-600 text-sm">Uploading images...</p>}
        </Section>
        
        <Section title="Description" description="Provide a detailed description of your bounce house, its features, and any rules." required>
          <Textarea 
            name="description" 
            value={listingData.description} 
            onChange={handleInputChange} 
            rows="6" 
            placeholder="Describe the theme, size, features like slides or basketball hoops, and ideal age range."
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </Section>

        <Section title="Pricing" description="Choose how you want to charge for your rental." required>
          <div className="flex gap-4 mb-4">
            <button 
              type="button" 
              onClick={() => setListingData({...listingData, pricing_model: 'daily'})} 
              className={`flex-1 p-4 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                listingData.pricing_model === 'daily' 
                  ? 'bg-blue-100 border-blue-500 text-blue-700' 
                  : 'hover:bg-gray-50 border-gray-300'
              }`}
            >
              <DollarSign /> Daily Rate
            </button>
            <button 
              type="button" 
              onClick={() => setListingData({...listingData, pricing_model: 'hourly'})} 
              className={`flex-1 p-4 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                listingData.pricing_model === 'hourly' 
                  ? 'bg-blue-100 border-blue-500 text-blue-700' 
                  : 'hover:bg-gray-50 border-gray-300'
              }`}
            >
              <Clock /> Hourly Rate
            </button>
          </div>
          
          {listingData.pricing_model === 'daily' ? (
            <div>
              <Label htmlFor="price_per_day">Price per day ($) <span className="text-red-500">*</span></Label>
              <Input 
                id="price_per_day" 
                name="price_per_day" 
                type="number" 
                value={listingData.price_per_day} 
                onChange={handleInputChange} 
                placeholder="e.g., 150"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
          ) : (
            <div>
              <Label htmlFor="price_per_hour">Price per hour ($) <span className="text-red-500">*</span></Label>
              <Input 
                id="price_per_hour" 
                name="price_per_hour" 
                type="number" 
                value={listingData.price_per_hour} 
                onChange={handleInputChange} 
                placeholder="e.g., 50"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              <p className="text-sm text-gray-500 mt-1">You can set minimum rental hours on the booking page later.</p>
            </div>
          )}
        </Section>

        <Section title="Location" description="Where is the bounce house located? We only show the general area to guests." required>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
              <Input 
                id="city" 
                name="city" 
                value={listingData.location.city} 
                onChange={e => handleNestedInputChange('location', e.target.name, e.target.value)}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            <div>
              <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
              <Input 
                id="state" 
                name="state" 
                value={listingData.location.state} 
                onChange={e => handleNestedInputChange('location', e.target.name, e.target.value)}
                className={errors.state ? "border-red-500" : ""}
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>
          </div>
          {geocodeError && <p className="text-yellow-600 bg-yellow-50 p-3 rounded-md text-sm mt-4">{geocodeError}</p>}
        </Section>

        <Section title="Details" description="Provide some additional details about your bounce house.">
          <div className="space-y-6">
            <div>
              <Label htmlFor="capacity">Capacity (Max number of kids)</Label>
              <Input 
                id="capacity" 
                name="capacity" 
                type="number" 
                value={listingData.capacity} 
                onChange={handleInputChange} 
                placeholder="e.g., 8" 
              />
            </div>
            
            <div>
              <Label>What this place offers</Label>
              <p className="text-sm text-gray-600 mb-4">Select all amenities that apply to your bounce house</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {AMENITY_OPTIONS.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={listingData.amenities.includes(amenity)}
                      onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                      className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <div className="pt-8 flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading} 
            size="lg" 
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          >
            {isSubmitting ? (editMode ? "Updating..." : "Creating...") : (editMode ? "Update Listing" : "Create My Listing")}
          </Button>
        </div>
      </form>
    </div>
  );
}
