import * as vscode from "vscode";
import * as dotenv from "dotenv";
import { checkoutAndCreateBranch } from "./gitHelper";
let fetch: any;
(async () => {
  fetch = (await import("node-fetch")).default;
})();

// Load .env file
dotenv.config({ path: __dirname + "/../.env" });

const LINEAR_API_URL = "https://api.linear.app/graphql";
// const API_KEY = process.env.LINEAR_API_KEY || "";

// const createdBranches = new Set<string>(); // Stores ticket IDs with created branches

export async function getAssignedTickets(apiKey: string) {
  try {
    const query = `
      query {
        viewer {
          assignedIssues(filter: { state: { name: { eq: "In Progress" } } }) {
            nodes {
              id
              title
              branchName
            }
          }
        }
      }
    `;

    const response = await fetch(LINEAR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Linear API Error: ${response.statusText}`);
    }

    const data = (await response.json()) as { 
      data: { 
        viewer: { assignedIssues: { nodes: any[] } } 
      } 
    };
    return data.data.viewer.assignedIssues.nodes;
  } catch (error) {
    vscode.window.showErrorMessage(`Error fetching Linear tickets: ${error}`);
    return [];
  }
}

// export async function handleTickets(apiKey: string, developmentBranch: string) {
//   const tickets = await getAssignedTickets(apiKey);

//   for (const ticket of tickets) {
//     if (!ticket.branchName) {
//       console.warn(`Skipping ticket ${ticket.id}: No branch name defined`);
//       continue;
//     }

//     if (!createdBranches.has(ticket.id)) {
//       createdBranches.add(ticket.id); // Mark branch as created
//       await checkoutAndCreateBranch(ticket.branchName, developmentBranch);
//     }
//   }

//   // Clean up removed tickets
//   const currentTicketIds = new Set(tickets.map((t) => t.id));
//   for (const branchId of createdBranches) {
//     if (!currentTicketIds.has(branchId)) {
//       createdBranches.delete(branchId);
//     }
//   }
// }
