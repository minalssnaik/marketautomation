import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Target, 
  Plus, 
  X, 
  BarChart3, 
  Sparkles,
  Clock,
  UserCheck
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PREDEFINED_TRENDS = [
  "Sustainable Jewelry", "Lab-grown Diamonds", "Personalized Designs", 
  "Digital-first Shopping", "Minimalist Jewelry", "Vintage Revival",
  "Statement Earrings", "Stackable Rings", "Cultural Fusion", 
  "Ethical Sourcing", "Smart Jewelry", "Conversion Pieces"
];

const PREDEFINED_PERSONAS = [
  "Traditional Buyer", "Modern Millennial", "Gen-Z Shopper", 
  "Luxury Enthusiast", "Investment Focused", "Wedding Shopper",
  "Corporate Professional", "Collector", "Gifting Segment", 
  "Bridal Market"
];

const TIMEFRAME_OPTIONS = [
  { value: "30 days", label: "Next 30 Days" },
  { value: "60 days", label: "Next 60 Days" },
  { value: "90 days", label: "Next 90 Days" },
  { value: "6 months", label: "Next 6 Months" },
  { value: "1 year", label: "Next 1 Year" }
];

const COMPETITOR_OPTIONS = [
  { value: 5, label: "Top 5 Competitors" },
  { value: 10, label: "Top 10 Competitors" },
  { value: 15, label: "Top 15 Competitors" }
];

function ParameterSelection({ onParametersSelected }) {
  const [selectedTrends, setSelectedTrends] = useState([]);
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [timeframe, setTimeframe] = useState("");
  const [numCompetitors, setNumCompetitors] = useState(10);
  const [customParameters, setCustomParameters] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const addTrend = (trend) => {
    if (selectedTrends.length < 8 && !selectedTrends.includes(trend)) {
      setSelectedTrends([...selectedTrends, trend]);
    }
  };

  const removeTrend = (trend) => {
    setSelectedTrends(selectedTrends.filter(t => t !== trend));
  };

  const addPersona = (persona) => {
    if (selectedPersonas.length < 6 && !selectedPersonas.includes(persona)) {
      setSelectedPersonas([...selectedPersonas, persona]);
    }
  };

  const removePersona = (persona) => {
    setSelectedPersonas(selectedPersonas.filter(p => p !== persona));
  };

  const addCustomParameter = () => {
    if (customInput.trim() && customParameters.length < 5 && !customParameters.includes(customInput.trim())) {
      setCustomParameters([...customParameters, customInput.trim()]);
      setCustomInput("");
    }
  };

  const removeCustomParameter = (param) => {
    setCustomParameters(customParameters.filter(p => p !== param));
  };

  const handleSubmit = async () => {
    // Validation
    if (selectedTrends.length === 0) {
      toast.error("Please select at least one emerging trend");
      return;
    }
    if (selectedPersonas.length === 0) {
      toast.error("Please select at least one persona");
      return;
    }
    if (!timeframe) {
      toast.error("Please select a timeframe");
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85));
      }, 300);

      const response = await axios.post(`${API}/parameters`, {
        emerging_trends: selectedTrends,
        timeframe: timeframe,
        personas: selectedPersonas,
        num_competitors: numCompetitors,
        custom_parameters: customParameters
      });

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        onParametersSelected(response.data.id);
      }, 1000);

    } catch (error) {
      console.error("Error saving parameters:", error);
      toast.error("Failed to save parameters. Please try again.");
      setLoading(false);
      setProgress(0);
    }
  };

  const getValidationScore = () => {
    let score = 0;
    if (selectedTrends.length > 0) score += 25;
    if (selectedPersonas.length > 0) score += 25;
    if (timeframe) score += 25;
    if (numCompetitors > 0) score += 25;
    return score;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            <h1 className="text-4xl font-bold gradient-text">Market Pulse Dashboard</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Configure your market analysis parameters to generate comprehensive insights for Kalyan Jewellers
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-6 fade-in" style={{ animationDelay: "0.1s" }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Configuration Progress</span>
                  <span className="text-gray-600">{getValidationScore()}% Complete</span>
                </div>
                <Progress value={getValidationScore()} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {/* Emerging Trends Selection */}
          <Card className="fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Emerging Trends
                <Badge variant="secondary">{selectedTrends.length}/8</Badge>
              </CardTitle>
              <CardDescription>
                Select emerging trends that align with your market analysis focus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {PREDEFINED_TRENDS.map((trend) => (
                  <Button
                    key={trend}
                    variant={selectedTrends.includes(trend) ? "default" : "outline"}
                    size="sm"
                    onClick={() => selectedTrends.includes(trend) ? removeTrend(trend) : addTrend(trend)}
                    className={`justify-start ${selectedTrends.includes(trend) ? 'bg-orange-500 hover:bg-orange-600' : 'hover:border-orange-300'}`}
                    data-testid={`trend-${trend.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {selectedTrends.includes(trend) && <X className="h-4 w-4 mr-1" />}
                    {trend}
                  </Button>
                ))}
              </div>
              
              {selectedTrends.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Selected Trends:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrends.map((trend) => (
                      <Badge 
                        key={trend} 
                        variant="default" 
                        className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                      >
                        {trend}
                        <button
                          onClick={() => removeTrend(trend)}
                          className="ml-2 hover:text-orange-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeframe Selection */}
          <Card className="fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Analysis Timeframe
              </CardTitle>
              <CardDescription>
                Choose the timeframe for trend forecasting and market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={timeframe} onValueChange={setTimeframe} data-testid="timeframe-select">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select analysis timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Target Personas */}
          <Card className="fade-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-orange-500" />
                Target Personas
                <Badge variant="secondary">{selectedPersonas.length}/6</Badge>
              </CardTitle>
              <CardDescription>
                Select target customer personas for audience segmentation analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {PREDEFINED_PERSONAS.map((persona) => (
                  <Button
                    key={persona}
                    variant={selectedPersonas.includes(persona) ? "default" : "outline"}
                    size="sm"
                    onClick={() => selectedPersonas.includes(persona) ? removePersona(persona) : addPersona(persona)}
                    className={`justify-start ${selectedPersonas.includes(persona) ? 'bg-orange-500 hover:bg-orange-600' : 'hover:border-orange-300'}`}
                    data-testid={`persona-${persona.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {selectedPersonas.includes(persona) && <X className="h-4 w-4 mr-1" />}
                    {persona}
                  </Button>
                ))}
              </div>

              {selectedPersonas.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Selected Personas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPersonas.map((persona) => (
                      <Badge 
                        key={persona} 
                        variant="default" 
                        className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                      >
                        {persona}
                        <button
                          onClick={() => removePersona(persona)}
                          className="ml-2 hover:text-orange-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competitor Analysis */}
          <Card className="fade-in" style={{ animationDelay: "0.5s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                Competitor Analysis Scope
              </CardTitle>
              <CardDescription>
                Choose how many competitors to include in your analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={numCompetitors.toString()} onValueChange={(value) => setNumCompetitors(parseInt(value))} data-testid="competitors-select">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select number of competitors" />
                </SelectTrigger>
                <SelectContent>
                  {COMPETITOR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Custom Parameters */}
          <Card className="fade-in" style={{ animationDelay: "0.6s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-orange-500" />
                Custom Analysis Parameters
                <Badge variant="secondary">{customParameters.length}/5</Badge>
              </CardTitle>
              <CardDescription>
                Add custom parameters specific to your analysis needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter custom parameter (e.g., Geographic Markets, Content Themes)"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomParameter()}
                  className="flex-1"
                  data-testid="custom-parameter-input"
                />
                <Button 
                  onClick={addCustomParameter} 
                  disabled={!customInput.trim() || customParameters.length >= 5}
                  className="bg-orange-500 hover:bg-orange-600"
                  data-testid="add-custom-parameter"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {customParameters.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Custom Parameters:</Label>
                  <div className="flex flex-wrap gap-2">
                    {customParameters.map((param) => (
                      <Badge 
                        key={param} 
                        variant="outline"
                        className="border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        {param}
                        <button
                          onClick={() => removeCustomParameter(param)}
                          className="ml-2 hover:text-orange-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-8 fade-in" style={{ animationDelay: "0.7s" }}>
          <Card>
            <CardContent className="pt-6">
              {loading && (
                <div className="mb-4">
                  <Progress value={progress} className="h-2 mb-2" />
                  <p className="text-sm text-gray-600 text-center">
                    Configuring your dashboard... {progress}%
                  </p>
                </div>
              )}
              
              <Button
                onClick={handleSubmit}
                disabled={loading || getValidationScore() < 75}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-semibold disabled:opacity-50"
                data-testid="generate-dashboard-button"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating Dashboard...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Generate Market Pulse Dashboard
                  </div>
                )}
              </Button>
              
              <p className="text-sm text-gray-600 text-center mt-3">
                Complete at least 75% of configuration to generate your dashboard
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ParameterSelection;