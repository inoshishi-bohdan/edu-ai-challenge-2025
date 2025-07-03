# Service Report Generator Console App

This is a .NET console application that generates a structured report for a given service name (e.g., "Spotify", "Notion") or a raw service description. The app uses the OpenAI API to generate the report, which includes:

- Brief History
- Target Audience
- Core Features
- Unique Selling Points
- Business Model
- Tech Stack Insights
- Perceived Strengths
- Perceived Weaknesses

## Prerequisites

- [.NET 6.0 SDK or later](https://dotnet.microsoft.com/download)
- An OpenAI API key ([get one here](https://platform.openai.com/account/api-keys))

## Setup

1. **Clone the repository or copy the app folder.**
2. **Navigate to the project directory:**
   ```sh
   cd 9
   ```
3. **Restore dependencies (optional, handled by `dotnet run`):**
   ```sh
   dotnet restore
   ```

## Setting the OpenAI API Key

The application requires your OpenAI API key to be set as an environment variable named `OPENAI_API_KEY`.

### Windows (PowerShell)
```powershell
$env:OPENAI_API_KEY="your_openai_api_key_here"
```

### Windows (Command Prompt)
```cmd
set OPENAI_API_KEY=your_openai_api_key_here
```

### Linux/macOS
```sh
export OPENAI_API_KEY=your_openai_api_key_here
```

> **Note:** You must set the environment variable in the same terminal session where you run the app, or set it system-wide for persistent use.

## Running the Application

From the root of the repository or inside the `9` folder, run:

```sh
dotnet run --project 9/9.csproj
```

Or, if you are already in the `9` directory:

```sh
dotnet run
```

## Usage

1. When prompted, enter a service name (e.g., `Spotify`, `Notion`) or paste a raw service description.
2. The app will call the OpenAI API and display a structured report in the console window.

## Example

```
Enter a service name (e.g. 'Spotify', 'Notion') or a raw service description:
Spotify

--- Generated Report ---

[Report will be displayed here]
```

## Troubleshooting

- **Missing API Key:**
  - If you see `Error: Please set the OPENAI_API_KEY environment variable.`, make sure you have set your API key as described above.
- **API Errors:**
  - If you receive an error from the OpenAI API, check your API key, network connection, and your OpenAI account limits.

## Customization

- To use a different OpenAI model (e.g., `gpt-4.1-nano`), change the `model` value in `Program.cs`.
- You can adjust the prompt or report structure in the code to fit your needs.

## License

This project is for educational and demonstration purposes. 