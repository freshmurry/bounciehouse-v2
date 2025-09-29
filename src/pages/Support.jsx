import React, { useState } from "react";
import { SupportTicket } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
// ...existing code... (removed unused createPageUrl import)

export default function SupportPage() {
  const [ticket, setTicket] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await SupportTicket.create({ ...ticket, user_id: 'current_user_id_placeholder' });
      alert("Support ticket submitted successfully!");
      setTicket({ subject: "", description: "", priority: "medium" });
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to submit ticket. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicket({ ...ticket, [name]: value });
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="neu-raised p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Contact Support</h1>
        <p className="text-gray-600 text-center mb-8">
          Have an issue or a question? We're here to help.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              value={ticket.subject}
              onChange={handleInputChange}
              className="neu-inset"
              required
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={ticket.priority}
              onValueChange={(value) => setTicket({ ...ticket, priority: value })}
            >
              <SelectTrigger className="neu-inset">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="neu-raised">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">How can we help?</Label>
            <Textarea
              id="description"
              name="description"
              value={ticket.description}
              onChange={handleInputChange}
              className="neu-inset h-40"
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full neu-button bg-blue-600 text-white py-6 text-lg">
            {isSubmitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </form>
      </div>
    </div>
  );
}