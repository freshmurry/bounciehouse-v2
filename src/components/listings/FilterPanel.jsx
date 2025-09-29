import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';

export default function FilterPanel({ isOpen, onClose, onApplyFilters, initialFilters = {} }) {
  const [filters, setFilters] = useState({
    priceRange: initialFilters.priceRange || [0, 500],
    capacity: initialFilters.capacity || '',
    amenities: initialFilters.amenities || [],
    location: initialFilters.location || '',
    availability: initialFilters.availability || 'any',
    ...initialFilters
  });

  const amenityOptions = [
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

  const handleAmenityChange = (amenity, checked) => {
    setFilters(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      priceRange: [0, 500],
      capacity: '',
      amenities: [],
      location: '',
      availability: 'any'
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Price Range */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Price Range</Label>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                max={1000}
                min={0}
                step={25}
                className="mb-4"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}+</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-lg font-semibold mb-2 block">Location</Label>
            <Input
              id="location"
              placeholder="Enter city or zip code"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          {/* Capacity */}
          <div>
            <Label htmlFor="capacity" className="text-lg font-semibold mb-2 block">Minimum Capacity</Label>
            <Select value={filters.capacity} onValueChange={(value) => setFilters(prev => ({ ...prev, capacity: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Any capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Any capacity</SelectItem>
                <SelectItem value="5">5+ people</SelectItem>
                <SelectItem value="10">10+ people</SelectItem>
                <SelectItem value="15">15+ people</SelectItem>
                <SelectItem value="20">20+ people</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenities */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Amenities</Label>
            <div className="grid grid-cols-2 gap-3">
              {amenityOptions.map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <Label className="text-lg font-semibold mb-2 block">Availability</Label>
            <Select value={filters.availability} onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any time</SelectItem>
                <SelectItem value="today">Available today</SelectItem>
                <SelectItem value="week">Available this week</SelectItem>
                <SelectItem value="weekend">Available this weekend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={handleClearFilters} className="flex-1">
              Clear all
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1 bg-gray-900 hover:bg-gray-800">
              Show results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}