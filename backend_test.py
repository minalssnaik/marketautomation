import requests
import sys
import json
from datetime import datetime

class MarketPulseDashboardTester:
    def __init__(self, base_url="https://market-pulse-281.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.parameter_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            print(f"   Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'id' in response_data:
                        print(f"   Response ID: {response_data['id']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout after {timeout}s")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_save_parameters(self):
        """Test parameter saving"""
        test_params = {
            "emerging_trends": ["Sustainable Jewelry", "Lab-grown Diamonds", "Personalized Designs"],
            "timeframe": "90 days",
            "personas": ["Modern Millennial", "Gen-Z Shopper", "Luxury Enthusiast"],
            "num_competitors": 10,
            "custom_parameters": ["Geographic Markets", "Content Themes"]
        }
        
        success, response = self.run_test(
            "Save Parameters",
            "POST",
            "parameters",
            200,
            data=test_params
        )
        
        if success and 'id' in response:
            self.parameter_id = response['id']
            print(f"   Saved Parameter ID: {self.parameter_id}")
            return True
        return False

    def test_get_parameters(self):
        """Test getting all parameters"""
        success, response = self.run_test(
            "Get All Parameters",
            "GET",
            "parameters",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} parameter sets")
            return True
        return False

    def test_market_research(self):
        """Test market research generation"""
        if not self.parameter_id:
            print("❌ Skipping - No parameter ID available")
            return False
            
        success, response = self.run_test(
            "Generate Market Research",
            "GET",
            f"parameters/{self.parameter_id}/market-research",
            200,
            timeout=45
        )
        
        if success and 'competitors' in response:
            print(f"   Generated data for {len(response['competitors'])} competitors")
            print(f"   Found {len(response['emerging_trends'])} trends")
            return True
        return False

    def test_audience_segmentation(self):
        """Test audience segmentation generation"""
        if not self.parameter_id:
            print("❌ Skipping - No parameter ID available")
            return False
            
        success, response = self.run_test(
            "Generate Audience Segmentation",
            "GET",
            f"parameters/{self.parameter_id}/audience-segmentation",
            200,
            timeout=45
        )
        
        if success and 'personas' in response:
            print(f"   Generated {len(response['personas'])} personas")
            print(f"   Demographics data: {list(response['demographics'].keys())}")
            return True
        return False

    def test_brand_positioning(self):
        """Test brand positioning generation"""
        if not self.parameter_id:
            print("❌ Skipping - No parameter ID available")
            return False
            
        success, response = self.run_test(
            "Generate Brand Positioning",
            "GET",
            f"parameters/{self.parameter_id}/brand-positioning",
            200,
            timeout=45
        )
        
        if success and 'positioning_map' in response:
            print(f"   Generated positioning map with {len(response['positioning_map']['quadrants'])} quadrants")
            print(f"   Found {len(response['messaging_recommendations'])} messaging recommendations")
            return True
        return False

    def test_content_generation(self):
        """Test AI content generation"""
        if not self.parameter_id:
            print("❌ Skipping - No parameter ID available")
            return False
            
        content_request = {
            "parameter_id": self.parameter_id,
            "brand_context": "Kalyan Jewellers - Premium jewelry brand focusing on traditional and contemporary designs"
        }
        
        success, response = self.run_test(
            "Generate AI Content",
            "POST",
            f"parameters/{self.parameter_id}/content-generation",
            200,
            data=content_request,
            timeout=60  # AI generation might take longer
        )
        
        if success and 'viral_post_ideas' in response:
            print(f"   Generated {len(response['viral_post_ideas'])} viral post ideas")
            print(f"   Content calendar: {len(response['content_calendar'])} weeks")
            print(f"   Hashtag research: {len(response['hashtag_research'])} hashtags")
            print(f"   AI Confidence: {response['engagement_predictions'].get('ai_confidence', 'N/A')}")
            return True
        return False

    def test_dashboard_summary(self):
        """Test dashboard summary endpoint"""
        if not self.parameter_id:
            print("❌ Skipping - No parameter ID available")
            return False
            
        success, response = self.run_test(
            "Get Dashboard Summary",
            "GET",
            f"dashboard/{self.parameter_id}/summary",
            200,
            timeout=45
        )
        
        if success and 'parameters' in response:
            print(f"   Summary includes:")
            print(f"   - Parameters: {'✓' if response['parameters'] else '✗'}")
            print(f"   - Market Research: {'✓' if response['market_research'] else '✗'}")
            print(f"   - Audience Segmentation: {'✓' if response['audience_segmentation'] else '✗'}")
            print(f"   - Brand Positioning: {'✓' if response['brand_positioning'] else '✗'}")
            print(f"   - Content Generation: {'✓' if response['content_generation'] else '✗'}")
            return True
        return False

def main():
    print("🚀 Starting Market Pulse Dashboard API Tests")
    print("=" * 60)
    
    tester = MarketPulseDashboardTester()
    
    # Test sequence
    tests = [
        ("API Root", tester.test_api_root),
        ("Save Parameters", tester.test_save_parameters),
        ("Get Parameters", tester.test_get_parameters),
        ("Market Research", tester.test_market_research),
        ("Audience Segmentation", tester.test_audience_segmentation),
        ("Brand Positioning", tester.test_brand_positioning),
        ("AI Content Generation", tester.test_content_generation),
        ("Dashboard Summary", tester.test_dashboard_summary)
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())