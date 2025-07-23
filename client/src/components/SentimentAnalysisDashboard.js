import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, TrendingUp, TrendingDown, Minus, ExternalLink, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const SentimentAnalysisDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    keywords: [],
    trackingEnabled: false,
    lastFetchAt: null
  });
  const [summary, setSummary] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
    total: 0
  });
  const [mentions, setMentions] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [keywords, setKeywords] = useState('');

  // Fetch initial configuration and summary
  useEffect(() => {
    fetchConfig();
    fetchSummary();
    fetchMentions(0);
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get('/api/sentiment/config', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConfig(response.data);
      setKeywords(response.data.keywords.join(', '));
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get('/api/sentiment/summary?days=7', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSummary(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setLoading(false);
    }
  };

  const fetchMentions = async (newOffset = 0) => {
    setFeedLoading(true);
    try {
      const response = await axios.get(`/api/sentiment/feed?limit=20&offset=${newOffset}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (newOffset === 0) {
        setMentions(response.data);
      } else {
        setMentions(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === 20);
      setOffset(newOffset);
    } catch (error) {
      console.error('Error fetching mentions:', error);
    }
    setFeedLoading(false);
  };

  const updateConfig = async () => {
    try {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
      await axios.post('/api/sentiment/config', {
        keywords: keywordArray,
        trackingEnabled: config.trackingEnabled
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update local state
      setConfig(prev => ({ ...prev, keywords: keywordArray }));
      setEditMode(false);
      
      // Refresh data
      fetchSummary();
      fetchMentions(0);
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const toggleTracking = async () => {
    const newTrackingState = !config.trackingEnabled;
    try {
      await axios.post('/api/sentiment/config', {
        keywords: config.keywords,
        trackingEnabled: newTrackingState
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setConfig(prev => ({ ...prev, trackingEnabled: newTrackingState }));
    } catch (error) {
      console.error('Error toggling tracking:', error);
    }
  };

  // Prepare data for pie chart
  const pieData = [
    { name: 'Positive', value: summary.positive, color: '#10B981' },
    { name: 'Negative', value: summary.negative, color: '#EF4444' },
    { name: 'Neutral', value: summary.neutral, color: '#6B7280' }
  ].filter(item => item.value > 0);

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Brand Sentiment Analysis</h1>
        <p className="text-gray-600">
          Monitor what people are saying about your brand on social media
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Mentions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total}</div>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-600">
                  Positive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary.positive}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.total > 0 ? `${Math.round((summary.positive / summary.total) * 100)}%` : '0%'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-600">
                  Negative
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summary.negative}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.total > 0 ? `${Math.round((summary.negative / summary.total) * 100)}%` : '0%'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Neutral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{summary.neutral}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.total > 0 ? `${Math.round((summary.neutral / summary.total) * 100)}%` : '0%'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>
                  Overall sentiment breakdown for the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary.total > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.value} (${Math.round((entry.value / summary.total) * 100)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No data available yet. Enable tracking to start collecting mentions.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Mentions Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Mentions</CardTitle>
                <CardDescription>
                  Latest social media mentions of your brand
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {mentions.length > 0 ? (
                    <>
                      {mentions.map((mention) => (
                        <div key={mention.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={getSentimentColor(mention.sentiment)}>
                                {getSentimentIcon(mention.sentiment)}
                                <span className="ml-1">{mention.sentiment}</span>
                              </Badge>
                              <span className="text-sm text-gray-500">
                                @{mention.author}
                              </span>
                            </div>
                            <a
                              href={mention.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          <p className="text-sm">{mention.content}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(mention.created_at)}
                          </p>
                        </div>
                      ))}
                      
                      {hasMore && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => fetchMentions(offset + 20)}
                          disabled={feedLoading}
                        >
                          {feedLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Load More'
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No mentions found. Make sure tracking is enabled and keywords are configured.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Configuration</CardTitle>
              <CardDescription>
                Configure keywords and tracking settings for sentiment analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tracking Status */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Tracking Status</Label>
                  <p className="text-sm text-gray-500">
                    {config.trackingEnabled ? 'Actively monitoring mentions' : 'Tracking is paused'}
                  </p>
                </div>
                <Button
                  variant={config.trackingEnabled ? "destructive" : "default"}
                  onClick={toggleTracking}
                >
                  {config.trackingEnabled ? 'Disable Tracking' : 'Enable Tracking'}
                </Button>
              </div>

              {/* Keywords Configuration */}
              <div className="space-y-2">
                <Label>Keywords to Track</Label>
                <p className="text-sm text-gray-500">
                  Enter keywords separated by commas (e.g., "YourBrand, @yourbrand, #YourBrand")
                </p>
                {editMode ? (
                  <div className="space-y-2">
                    <Input
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="Enter keywords..."
                    />
                    <div className="flex gap-2">
                      <Button onClick={updateConfig}>Save</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditMode(false);
                          setKeywords(config.keywords.join(', '));
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {config.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(true)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              {/* Last Update Info */}
              {config.lastFetchAt && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Last updated: {formatDate(config.lastFetchAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Information */}
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Information about required API access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Twitter API</h4>
                  <p className="text-gray-600">
                    This feature requires Twitter API v2 access. Apply at{' '}
                    <a
                      href="https://developer.twitter.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      developer.twitter.com
                    </a>
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Google Cloud Natural Language API</h4>
                  <p className="text-gray-600">
                    Sentiment analysis is powered by Google Cloud. Set up at{' '}
                    <a
                      href="https://cloud.google.com/natural-language"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      cloud.google.com/natural-language
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SentimentAnalysisDashboard;