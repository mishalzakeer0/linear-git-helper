import * as vscode from "vscode";
import { getAssignedTickets } from "./linear";
import { checkoutAndCreateBranch } from "./gitHelper";

let lastAssignedTicketIds = new Set<string>(); // Stores previously assigned ticket IDs

export async function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("Linear Git Helper activated!");

  // Get API key from storage or ask user
  const apiKey = await getLinearApiKey(context);
  if (!apiKey) {
    vscode.window.showErrorMessage("❌ Linear API key is required to use this extension.");
    return;
  }

  let disposable = vscode.commands.registerCommand("extension.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from Linear Git Helper!");
  });

  context.subscriptions.push(disposable);

  // Start watching for assigned tickets
  checkForNewTickets(apiKey);
  setInterval(() => checkForNewTickets(apiKey), 60000); // Runs every 60 seconds
}

async function checkForNewTickets(apiKey: string) {
  console.log("🔄 Checking for assigned Linear tickets...");

  try {
    const tickets = await getAssignedTickets(apiKey);
    const currentAssignedTicketIds = new Set(tickets.map((t) => t.id));

    // Find newly assigned tickets
    const newTickets = tickets.filter((t) => !lastAssignedTicketIds.has(t.id));

    if (newTickets.length > 0) {
      for (const ticket of newTickets) {
        let defaultBranchName = ticket.branchName || ticket.title.replace(/\s+/g, "-").toLowerCase();

        const fromBranch = await vscode.window.showInputBox({
          prompt: "Checkout from?",
          value: "development", // Default value
          ignoreFocusOut: true,
        });

        if (!fromBranch) {
          vscode.window.showErrorMessage("❌ Checkout process cancelled.");
          return;
        }

        const toBranch = await vscode.window.showInputBox({
          prompt: "Checkout to?",
          value: defaultBranchName, // Default from Linear
          ignoreFocusOut: true,
        });

        if (!toBranch) {
          vscode.window.showErrorMessage("❌ Checkout process cancelled.");
          return;
        }

        console.log(`🔀 Checking out from ${fromBranch} to ${toBranch}`);
        await checkoutAndCreateBranch(toBranch, fromBranch);
      }
    } else {
      console.log("✅ No new tickets assigned.");
    }

    // Update last assigned tickets state
    lastAssignedTicketIds = currentAssignedTicketIds;
  } catch (error) {
    console.error("❌ Error in ticket polling loop:", error);
  }
}

// Function to prompt user for API key and store it
async function getLinearApiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
  let apiKey = context.globalState.get<string>("linearApiKey");

  if (!apiKey) {
    apiKey = await vscode.window.showInputBox({
      prompt: "Enter your Linear API Key",
      ignoreFocusOut: true,
      password: true,
    });

    if (apiKey) {
      await context.globalState.update("linearApiKey", apiKey);
      vscode.window.showInformationMessage("✅ Linear API Key saved!");
    }
  }

  return apiKey;
}

export function deactivate() {
  vscode.window.showInformationMessage("Linear Git Helper deactivated!");
}
