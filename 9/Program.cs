using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("Enter a service name (e.g. 'Spotify', 'Notion') or a raw service description:");
        string userInput = Console.ReadLine();

        string prompt = $@"Generate a report for the following service or description: {userInput}

Report Structure:
Brief History: Founding year, milestones, etc.
Target Audience: Primary user segments
Core Features: Top 2–4 key functionalities
Unique Selling Points: Key differentiators
Business Model: How the service makes money
Tech Stack Insights: Any hints about technologies used
Perceived Strengths: Mentioned positives or standout features
Perceived Weaknesses: Cited drawbacks or limitations
";

        string apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrEmpty(apiKey))
        {
            Console.WriteLine("Error: Please set the OPENAI_API_KEY environment variable.");
            return;
        }

        string report = await GetOpenAIReportAsync(prompt, apiKey);
        Console.WriteLine("\n--- Generated Report ---\n");
        Console.WriteLine(report);
    }

    static async Task<string> GetOpenAIReportAsync(string prompt, string apiKey)
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var requestBody = new
        {
            model = "gpt-4.1-nano",
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            max_tokens = 800
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);
        if (!response.IsSuccessStatusCode)
        {
            return $"Error: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}";
        }

        using var responseStream = await response.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(responseStream);
        var result = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        return result;
    }
}
