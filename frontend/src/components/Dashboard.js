import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Sparkles,
  RefreshCw,
  Download,
  Share,
  Eye,
  Clock,
  Award,
  Zap,
  DollarSign,
  Globe,
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
  Loader
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Dashboard({ parameterId, onReset }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState({
    market: true,
    audience: true,
    positioning: true,
    content: true
  });
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboardData();
  }, [parameterId]);

  const loadDashboardData = async () => {
    try {
      // Load summary first
      const summaryResponse = await axios.get(`${API}/dashboard/${parameterId}/summary`);
      setDashboardData(summaryResponse.data);

      // Load individual components if not present
      const loadPromises = [];

      if (!summaryResponse.data.market_research) {
        loadPromises.push(
          axios.get(`${API}/parameters/${parameterId}/market-research`).then(response => {
            setDashboardData(prev => ({ ...prev, market_research: response.data }));
            setLoading(prev => ({ ...prev, market: false }));
          })
        );
      } else {
        setLoading(prev => ({ ...prev, market: false }));
      }

      if (!summaryResponse.data.audience_segmentation) {
        loadPromises.push(
          axios.get(`${API}/parameters/${parameterId}/audience-segmentation`).then(response => {
            setDashboardData(prev => ({ ...prev, audience_segmentation: response.data }));
            setLoading(prev => ({ ...prev, audience: false }));
          })
        );
      } else {
        setLoading(prev => ({ ...prev, audience: false }));
      }

      if (!summaryResponse.data.brand_positioning) {
        loadPromises.push(
          axios.get(`${API}/parameters/${parameterId}/brand-positioning`).then(response => {
            setDashboardData(prev => ({ ...prev, brand_positioning: response.data }));
            setLoading(prev => ({ ...prev, positioning: false }));
          })
        );
      } else {
        setLoading(prev => ({ ...prev, positioning: false }));
      }

      if (!summaryResponse.data.content_generation) {
        loadPromises.push(
          axios.post(`${API}/parameters/${parameterId}/content-generation`, {
            parameter_id: parameterId,
            brand_context: "Kalyan Jewellers - Premium jewelry brand focusing on traditional and contemporary designs"
          }).then(response => {
            setDashboardData(prev => ({ ...prev, content_generation: response.data }));
            setLoading(prev => ({ ...prev, content: false }));
          })
        );
      } else {
        setLoading(prev => ({ ...prev, content: false }));
      }

      await Promise.all(loadPromises);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  const OverviewCard = ({ title, value, subtitle, icon: Icon, color, loading }) => (
    <Card className="feature-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {loading ? (
              <div className="flex items-center gap-2 mt-1">
                <Loader className="h-4 w-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
            ) : (
              <>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500">{subtitle}</p>
              </>
            )}
          </div>
          <div className={`p-3 rounded-full bg-opacity-10 ${color === 'text-orange-600' ? 'bg-orange-500' : color === 'text-blue-600' ? 'bg-blue-500' : color === 'text-green-600' ? 'bg-green-500' : 'bg-purple-500'}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const { parameters, market_research, audience_segmentation, brand_positioning, content_generation } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Market Pulse Dashboard</h1>
            </div>
            <Badge className="bg-orange-100 text-orange-800">
              Kalyan Jewellers Analysis
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onReset}
              data-testid="reset-dashboard-button"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Configuration Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              Analysis Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Timeframe</p>
                <Badge variant="secondary">{parameters.timeframe}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Competitors</p>
                <Badge variant="secondary">{parameters.num_competitors} companies</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Trends</p>
                <Badge variant="secondary">{parameters.emerging_trends.length} selected</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Personas</p>
                <Badge variant="secondary">{parameters.personas.length} segments</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <OverviewCard
            title="Market Competitors"
            value={parameters.num_competitors}
            subtitle="Companies analyzed"
            icon={Target}
            color="text-orange-600"
            loading={loading.market}
          />
          <OverviewCard
            title="Target Personas"
            value={parameters.personas.length}
            subtitle="Audience segments"
            icon={Users}
            color="text-blue-600"
            loading={loading.audience}
          />
          <OverviewCard
            title="Emerging Trends"
            value={parameters.emerging_trends.length}
            subtitle="Growth opportunities"
            icon={TrendingUp}
            color="text-green-600"
            loading={loading.market}
          />
          <OverviewCard
            title="Content Ideas"
            value={content_generation ? content_generation.viral_post_ideas.length : "0"}
            subtitle="AI-generated concepts"
            icon={Sparkles}
            color="text-purple-600"
            loading={loading.content}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="overview-tab">Overview</TabsTrigger>
            <TabsTrigger value="market" data-testid="market-tab">Market Research</TabsTrigger>
            <TabsTrigger value="audience" data-testid="audience-tab">Audience</TabsTrigger>
            <TabsTrigger value="content" data-testid="content-tab">Content Strategy</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Insights Summary */}
              <Card className="feature-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-500" />
                    Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading.market ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Analyzing market data...</span>
                    </div>
                  ) : market_research ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Top Competitors</p>
                        <div className="space-y-2">
                          {market_research.competitors.slice(0, 3).map((competitor, index) => (
                            <div key={competitor.name} className="flex justify-between items-center">
                              <span className="text-sm">{competitor.name}</span>
                              <Badge variant="outline">{competitor.market_share}%</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Emerging Trends</p>
                        {market_research.emerging_trends.slice(0, 3).map((trend) => (
                          <div key={trend.trend} className="flex justify-between items-center mb-1">
                            <span className="text-sm">{trend.trend}</span>
                            <Badge className="bg-green-100 text-green-800">+{trend.growth_rate}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Market research data unavailable</p>
                  )}
                </CardContent>
              </Card>

              {/* Audience Summary */}
              <Card className="feature-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Audience Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading.audience ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Analyzing audience data...</span>
                    </div>
                  ) : audience_segmentation ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Key Demographics</p>
                        <div className="space-y-2">
                          {Object.entries(audience_segmentation.demographics.age_distribution).map(([age, percent]) => (
                            <div key={age} className="flex justify-between items-center">
                              <span className="text-sm">{age}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">{percent}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Audience data unavailable</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Brand Positioning Map */}
            <Card className="feature-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Brand Positioning Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading.positioning ? (
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Generating positioning map...</span>
                  </div>
                ) : brand_positioning ? (
                  <div className="relative">
                    <div className="positioning-map mb-4">
                      {/* Positioning dot for Kalyan */}
                      <div 
                        className="positioning-dot"
                        style={{
                          left: `${(brand_positioning.positioning_map.quadrants.kalyan_position.position[0] / 10) * 100}%`,
                          top: `${100 - (brand_positioning.positioning_map.quadrants.kalyan_position.position[1] / 10) * 100}%`
                        }}
                      />
                      <div 
                        className="positioning-label"
                        style={{
                          left: `${(brand_positioning.positioning_map.quadrants.kalyan_position.position[0] / 10) * 100}%`,
                          top: `${100 - (brand_positioning.positioning_map.quadrants.kalyan_position.position[1] / 10) * 100 + 5}%`
                        }}
                      >
                        Kalyan Jewellers
                      </div>
                      
                      {/* Axis labels */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                        {brand_positioning.positioning_map.axes.x_axis}
                      </div>
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-600">
                        {brand_positioning.positioning_map.axes.y_axis}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {brand_positioning.positioning_map.quadrants.kalyan_position.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Positioning data unavailable</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Research Tab */}
          <TabsContent value="market" className="space-y-6">
            {loading.market ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Loader className="h-6 w-6 animate-spin text-orange-500" />
                    <span className="text-lg">Analyzing market data...</span>
                  </div>
                </CardContent>
              </Card>
            ) : market_research ? (
              <>
                {/* Competitor Analysis */}
                <Card className="feature-card">
                  <CardHeader>
                    <CardTitle>Competitor Landscape</CardTitle>
                    <CardDescription>
                      Analysis of top {market_research.competitors.length} competitors in the jewelry market
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {market_research.competitors.map((competitor, index) => (
                        <div key={competitor.name} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              <span className={`inline-block w-3 h-3 rounded-full ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}></span>
                              {competitor.name}
                            </h4>
                            <Badge variant="outline">{competitor.market_share}% Market Share</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-green-600 mb-1">Strengths</p>
                              <ul className="list-disc list-inside text-gray-600">
                                {competitor.strengths.map((strength, i) => (
                                  <li key={i}>{strength}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium text-red-600 mb-1">Weaknesses</p>
                              <ul className="list-disc list-inside text-gray-600">
                                {competitor.weaknesses.map((weakness, i) => (
                                  <li key={i}>{weakness}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Emerging Trends */}
                <Card className="feature-card">
                  <CardHeader>
                    <CardTitle>Emerging Market Trends</CardTitle>
                    <CardDescription>
                      Key trends driving growth in the jewelry industry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {market_research.emerging_trends.map((trend) => (
                        <div key={trend.trend} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{trend.trend}</h4>
                            <Badge className="bg-green-100 text-green-800">
                              +{trend.growth_rate}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Impact:</span>
                            <Badge variant={trend.impact === 'Very High' ? 'default' : trend.impact === 'High' ? 'secondary' : 'outline'}>
                              {trend.impact}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Trend Forecast */}
                <Card className="feature-card">
                  <CardHeader>
                    <CardTitle>Market Forecast</CardTitle>
                    <CardDescription>
                      Predictions for the next {parameters.timeframe}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {market_research.trend_forecast.map((forecast, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div className="flex-1">
                            <p className="font-medium">{forecast.trend}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">Confidence:</span>
                              <Badge variant="outline">{forecast.confidence}%</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center">Market research data unavailable</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            {loading.audience ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Loader className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="text-lg">Analyzing audience data...</span>
                  </div>
                </CardContent>
              </Card>
            ) : audience_segmentation ? (
              <>
                {/* Demographics Overview */}
                <Card className="feature-card">
                  <CardHeader>
                    <CardTitle>Audience Demographics</CardTitle>
                    <CardDescription>
                      Key demographic insights for jewelry market segments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Age Distribution</h4>
                        <div className="space-y-2">
                          {Object.entries(audience_segmentation.demographics.age_distribution).map(([age, percent]) => (
                            <div key={age} className="flex justify-between items-center">
                              <span className="text-sm">{age}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600 w-8">{percent}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Income Distribution</h4>
                        <div className="space-y-2">
                          {Object.entries(audience_segmentation.demographics.income_distribution).map(([income, percent]) => (
                            <div key={income} className="flex justify-between items-center">
                              <span className="text-sm">{income}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600 w-8">{percent}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Geographic Spread</h4>
                        <div className="space-y-2">
                          {Object.entries(audience_segmentation.demographics.geographic_spread).map(([geo, percent]) => (
                            <div key={geo} className="flex justify-between items-center">
                              <span className="text-sm">{geo}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600 w-8">{percent}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personas */}
                <Card className="feature-card">
                  <CardHeader>
                    <CardTitle>Target Personas</CardTitle>
                    <CardDescription>
                      Detailed customer personas for jewelry market segmentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {audience_segmentation.personas.map((persona) => (
                        <div key={persona.name} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            {persona.name}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Age Range:</span>
                              <span>{persona.age_range}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Income:</span>
                              <span>{persona.income}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Behavior:</span>
                              <p className="mt-1">{persona.behavior}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Key Drivers:</span>
                              <p className="mt-1 text-blue-600 font-medium">{persona.drivers}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Behavioral Patterns */}
                <Card className="feature-card">
                  <CardHeader>
                    <CardTitle>Behavioral Patterns</CardTitle>
                    <CardDescription>
                      Key behavioral insights from market analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {audience_segmentation.behavioral_patterns.map((pattern, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">{pattern.pattern}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Impact: </span>
                              <Badge className="bg-orange-100 text-orange-800">{pattern.impact}</Badge>
                            </div>
                            <div>
                              {pattern.percentage && (
                                <>
                                  <span className="text-gray-600">Adoption: </span>
                                  <Badge variant="outline">{pattern.percentage}%</Badge>
                                </>
                              )}
                              {pattern.months && (
                                <>
                                  <span className="text-gray-600">Peak Months: </span>
                                  <span>{pattern.months.join(', ')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center">Audience data unavailable</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Content Strategy Tab */}
          <TabsContent value="content" className="space-y-6">
            {loading.content ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Loader className="h-6 w-6 animate-spin text-purple-500" />
                    <span className="text-lg">Generating AI-powered content strategy...</span>
                  </div>
                </CardContent>
              </Card>
            ) : content_generation ? (
              <>
                {/* Engagement Predictions */}
                <Card className="feature-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-500" />
                      AI Content Performance Insights
                    </CardTitle>
                    <CardDescription>
                      Data-driven predictions based on competitor analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {content_generation.engagement_predictions.average_engagement}
                        </p>
                        <p className="text-sm text-gray-600">Avg Engagement</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {content_generation.engagement_predictions.viral_threshold}
                        </p>
                        <p className="text-sm text-gray-600">Viral Threshold</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {content_generation.engagement_predictions.ai_confidence}
                        </p>
                        <p className="text-sm text-gray-600">AI Confidence</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{content_generation.viral_post_ideas.length}</p>
                        <p className="text-sm text-gray-600">Viral Ideas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Viral Post Ideas */}
                <Card className="feature-card">
                  <CardHeader>
                    <CardTitle>AI-Generated Viral Post Ideas</CardTitle>
                    <CardDescription>
                      {content_generation.viral_post_ideas.length} content concepts based on successful jewelry brand patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content_generation.viral_post_ideas.slice(0, 8).map((idea) => (
                        <div key={idea.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{idea.title}</h4>
                            <Badge className="bg-green-100 text-green-800">
                              {idea.engagement_prediction}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{idea.concept}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {idea.best_time}
                            </span>
                            <div className="flex gap-1">
                              {idea.hashtags.map((tag, i) => (
                                <span key={i} className="text-blue-600">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {content_generation.viral_post_ideas.length > 8 && (
                      <Button variant="outline" className="w-full mt-4">
                        <Eye className="h-4 w-4 mr-2" />
                        View All {content_generation.viral_post_ideas.length} Ideas
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Content Calendar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="feature-card">
                    <CardHeader>
                      <CardTitle>Content Calendar</CardTitle>
                      <CardDescription>
                        Suggested posting schedule for {parameters.timeframe}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {content_generation.content_calendar.map((week) => (
                          <div key={week.week} className="border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">Week {week.week}</h4>
                              <Badge variant="outline">{week.post_count} posts</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1"><strong>Theme:</strong> {week.theme}</p>
                            <p className="text-sm text-gray-600"><strong>Focus:</strong> {week.focus}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="feature-card">
                    <CardHeader>
                      <CardTitle>Hashtag Research</CardTitle>
                      <CardDescription>
                        Performance data for jewelry industry hashtags
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {content_generation.hashtag_research.map((tag, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-blue-600">{tag.hashtag}</h4>
                              <Badge className="bg-purple-100 text-purple-800">
                                {tag.engagement}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Reach: {tag.reach}</span>
                              <span>Engagement: {tag.engagement}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center">Content strategy data unavailable</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Dashboard;