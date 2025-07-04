# Product Filter Console App

This is a .NET console application that uses the OpenAI API to filter products from a dataset based on natural language user queries. The app demonstrates advanced function calling and tool use with OpenAI's GPT models.

## Prerequisites

- [.NET 6.0 SDK or later](https://dotnet.microsoft.com/download)
- An OpenAI API key with access to function calling (tools)

## Setup

1. **Clone or download this repository.**
2. **Navigate to the `10` directory:**
   ```sh
   cd 10
   ```
3. **Set your OpenAI API key as an environment variable:**
   - On Windows (PowerShell):
     ```powershell
     $env:OPENAI_API_KEY="your-api-key-here"
     ```
   - On Windows (cmd):
     ```cmd
     set OPENAI_API_KEY=your-api-key-here
     ```
   - On Linux/macOS:
     ```sh
     export OPENAI_API_KEY=your-api-key-here
     ```

## How to Run

1. **Restore dependencies (first time only):**
   ```sh
   dotnet restore
   ```
2. **Run the application:**
   ```sh
   dotnet run
   ```
   or, if you are in the parent directory:
   ```sh
   dotnet run --project 10
   ```

## Usage

- When prompted, enter a natural language description of the products you want to find. For example:
  ```
  Describe how you want to filter products:
  Show me electronics under $200 with rating above 4 and in stock
  ```
- The app will use the OpenAI API to extract filter parameters and display a structured, numbered list of matching products.

## Example
See [`sample_outputs.md`](sample_outputs.md) for example requests and responses.

## Notes
- The product data is stored in `products.json` in the same directory.
- You must have a valid OpenAI API key with access to the required models and function calling features.
- The app uses the OpenAI API, so an internet connection is required.

## Troubleshooting
- If you see an error about the API key, make sure the `OPENAI_API_KEY` environment variable is set in your terminal session.
- If you get a 400 error from the OpenAI API, check that your API key is valid and you have access to the specified model.

---

Feel free to modify the product dataset or filtering logic to suit your needs! 