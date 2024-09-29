// JavaScript script to call OpenRouter API and display result in HTML

// OpenRouter API key (Ensure this is handled securely in production)
const API_KEY = "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";
const MODEL = "gpt-4o-mini";

// Function to get word definition using OpenRouter's GPT-4o-mini model
async function getWordDefinition(word) {
    const apiUrl = "https://openrouter.ai/v1/completions";

    // Set up request payload
    const payload = {
        model: MODEL,
        prompt: `Please provide a detailed dictionary-style explanation for the word: "${word}". Include definitions, examples, synonyms, antonyms, and usage in sentences.`,
        max_tokens: 300, // Adjust as needed
        temperature: 0.5 // Control randomness; 0.5 for balanced responses
    };

    // Set up request options
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payload)
    };

    try {
        // Fetch data from OpenRouter API
        const response = await fetch(apiUrl, options);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        // Parse response JSON
        const data = await response.json();
        return data.choices[0].text.trim();
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// Function to display the result in an HTML format suitable for ANKI
function displayWordDefinition(word, definition) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 10px; border: 1px solid #ccc;">
            <h2 style="color: #1C6FB8;">${word}</h2>
            <div>${definition}</div>
        </div>
    `;

    // Display the HTML content in a container (for example, a div with id "output")
    document.getElementById("output").innerHTML = htmlContent;
}

// Event listener for the search button
document.getElementById("searchButton").addEventListener("click", async () => {
    const word = document.getElementById("wordInput").value.trim();
    if (word) {
        // Fetch word definition
        const definition = await getWordDefinition(word);
        if (definition) {
            // Display word definition in HTML format
            displayWordDefinition(word, definition);
        } else {
            alert("Unable to retrieve definition. Please try again later.");
        }
    } else {
        alert("Please enter a word to search.");
    }
});
