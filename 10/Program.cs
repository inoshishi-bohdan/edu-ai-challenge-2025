// See https://aka.ms/new-console-template for more information
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

// Product class to match JSON structure
public class Product
{
    [JsonPropertyName("name")]
    public string Name { get; set; }
    [JsonPropertyName("category")]
    public string Category { get; set; }
    [JsonPropertyName("price")]
    public double Price { get; set; }
    [JsonPropertyName("rating")]
    public double Rating { get; set; }
    [JsonPropertyName("in_stock")]
    public bool InStock { get; set; }
}

// Class to hold filter parameters
public class FilterParams
{
    public double? maxPrice { get; set; }
    public double? minRating { get; set; }
    public List<string> categories { get; set; } = new List<string>();
    public bool? inStock { get; set; }
    public string nameContains { get; set; }
}

class Program
{
    static string Normalize(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return "";
        // Remove all non-letter/digit/space
        var cleaned = Regex.Replace(input.ToLowerInvariant(), "[^a-z0-9 ]", "");
        // Collapse multiple spaces
        return Regex.Replace(cleaned, " +", " ").Trim();
    }

    static bool NameTokenMatch(string productName, string search)
    {
        var productTokens = Normalize(productName).Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var searchTokens = Normalize(search).Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return searchTokens.All(token => productTokens.Any(pt => pt.StartsWith(token)));
    }

    static List<Product> FilterProducts(List<Product> products, FilterParams filterParams)
    {
        var validCategories = filterParams.categories?
            .Where(cat => !string.IsNullOrWhiteSpace(cat))
            .Select(cat => cat.Trim())
            .ToList();
        string normalizedNameContains = Normalize(filterParams.nameContains);

        return products.Where(p =>
            (!filterParams.maxPrice.HasValue || p.Price <= filterParams.maxPrice.Value) &&
            (!filterParams.minRating.HasValue || p.Rating >= filterParams.minRating.Value) &&
            (validCategories == null || validCategories.Count == 0 ||
                validCategories.Any(cat => string.Equals(cat, p.Category?.Trim(), StringComparison.OrdinalIgnoreCase))) &&
            (!filterParams.inStock.HasValue || p.InStock == filterParams.inStock.Value) &&
            (string.IsNullOrWhiteSpace(filterParams.nameContains) ||
                NameTokenMatch(p.Name, filterParams.nameContains))
        ).ToList();
    }

    static async Task Main(string[] args)
    {
        var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrEmpty(apiKey))
        {
            Console.WriteLine("Error: OPENAI_API_KEY environment variable is not set.");
            return;
        }

        Console.WriteLine("Describe how you want to filter products:");
        string userQuery = Console.ReadLine();

        string json = File.ReadAllText("products.json");
        var products = JsonSerializer.Deserialize<List<Product>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        // Define the tool schema
        var tools = new[]
        {
            new {
                type = "function",
                function = new {
                    name = "FilterProducts",
                    description = "Filter products by maxPrice, minRating, categories, inStock, and nameContains.",
                    parameters = new {
                        type = "object",
                        properties = new {
                            maxPrice = new { type = "number", description = "Maximum price" },
                            minRating = new { type = "number", description = "Minimum rating" },
                            categories = new { type = "array", items = new { type = "string" }, description = "Product categories e.g. Electronics, Fitness, Kitchen, Books, Clothing" },
                            inStock = new { type = "boolean", description = "Stock availability" },
                            nameContains = new { type = "string", description = "A keyword that should be in the product name, e.g. 'speaker', 'laptop', 'jeans'" }
                        },
                        required = new[] { "maxPrice", "minRating", "categories", "inStock" },
                        additionalProperties = false
                    }
                }
            }
        };

        var input = new List<object>
        {
            new { role = "system", content = "After receiving the filtered products, respond with a structured, numbered list in the following format: 'Filtered Products:\n1. Product Name - $Price, Rating: X.X, In Stock/Out of Stock'. Only include the filtered products in your response." },
            new { role = "user", content = userQuery }
        };

        using var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var content = new StringContent(JsonSerializer.Serialize(new
        {
            model = "gpt-4.1-nano",
            messages = input,
            tools = tools
        }));
        content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

        var response = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine("OpenAI API error: " + errorBody);
            return;
        }
        var responseString = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(responseString);
        var choice = doc.RootElement.GetProperty("choices")[0];
        var message = choice.GetProperty("message");
        var toolCalls = message.GetProperty("tool_calls");

        // 2. Get tool call and arguments
        var toolCall = toolCalls[0];
        var callId = toolCall.GetProperty("id").GetString();
        var argumentsJson = toolCall.GetProperty("function").GetProperty("arguments").GetString();
        var filterParams = JsonSerializer.Deserialize<FilterParams>(argumentsJson);
        // 3. Call your function
        var filtered = FilterProducts(products, filterParams);

        // 4. Prepare the input for the second OpenAI call
        input.Add(new {
            role = "assistant",
            tool_calls = new[] {
                new {
                    id = callId,
                    type = "function",
                    function = new {
                        name = "FilterProducts",
                        arguments = argumentsJson
                    }
                }
            }
        });
        input.Add(new {
            role = "tool",
            tool_call_id = callId,
            name = "FilterProducts",
            content = JsonSerializer.Serialize(filtered)
        });

        // 5. Second OpenAI call to get the final response
        var requestBody2 = new
        {
            model = "gpt-4.1-nano",
            messages = input,
            tools = tools,
            store = true
        };

        var content2 = new StringContent(JsonSerializer.Serialize(requestBody2));
        content2.Headers.ContentType = new MediaTypeHeaderValue("application/json");

        var response2 = await client.PostAsync("https://api.openai.com/v1/chat/completions", content2);
        response2.EnsureSuccessStatusCode();
        var responseString2 = await response2.Content.ReadAsStringAsync();

        using var doc2 = JsonDocument.Parse(responseString2);
        var outputText = doc2.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        Console.WriteLine(outputText);
    }
}

