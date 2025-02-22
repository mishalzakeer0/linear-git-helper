import simpleGit from "simple-git";
import * as vscode from "vscode";

const git = simpleGit(vscode.workspace.rootPath || process.cwd());

export async function checkoutAndCreateBranch(toBranch: string, fromBranch: string) {
  try {
    // Check for uncommitted changes
    const status = await git.status();
    if (status.files.length > 0) {
      const choice = await vscode.window.showQuickPick(["Stash", "Commit", "Cancel"], {
        placeHolder: "Uncommitted changes detected! Choose an action:",
      });

      if (!choice || choice === "Cancel") {
        vscode.window.showErrorMessage("❌ Checkout cancelled due to uncommitted changes.");
        return;
      }

      if (choice === "Stash") {
        await git.stash();
        vscode.window.showInformationMessage("📌 Changes stashed successfully.");
      } else if (choice === "Commit") {
        const commitMessage = await vscode.window.showInputBox({
          prompt: "Enter commit message",
          ignoreFocusOut: true,
        });

        if (!commitMessage) {
          vscode.window.showErrorMessage("❌ Commit cancelled due to empty commit message.");
          return;
        }

        await git.add(".");
        await git.commit(commitMessage);
        vscode.window.showInformationMessage(`✅ Changes committed: ${commitMessage}`);
      }
    }

    // Checkout to development/source branch
    await git.checkout(fromBranch);
    await git.pull("origin", fromBranch);

    // Create and switch to the new branch
    await git.checkoutLocalBranch(toBranch);
    vscode.window.showInformationMessage(`🔀 Switched to new branch: ${toBranch}`);
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Git Error: ${error}`);
  }
}

// export async function checkoutToDevelopment(developmentBranch: string) {
//   try {
//     await git.checkout(developmentBranch);
//     await git.pull("origin", developmentBranch);
//     vscode.window.showInformationMessage(`🔙 Switched back to ${developmentBranch}`);
//   } catch (error) {
//     vscode.window.showErrorMessage(`❌ Git Error: ${error}`);
//   }
// }
