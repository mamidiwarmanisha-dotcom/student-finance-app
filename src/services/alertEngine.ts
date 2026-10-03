import type { Budget, BudgetLine, Alert } from '../types/models';
import { repository } from '../data/localStorageRepository';

export class AlertEngine {
  /**
   * Evaluates overall budget and category-level limits against current spending.
   * Emits and persists alerts when 50%, 80%, or 100% thresholds are newly crossed.
   * Ensures the same alert is not repeatedly created.
   */
  static async evaluate(
    budget: Budget,
    budgetLines: BudgetLine[],
    totalSpent: number,
    spentByCategory: Record<string, number>
  ): Promise<Alert[]> {
    if (!budget || budget.total_limit <= 0) {
      return [];
    }

    const existingAlerts = await repository.getAlerts(budget.id);
    const newAlerts: Alert[] = [];
    const thresholds: (50 | 80 | 100)[] = [50, 80, 100];

    // 1. Evaluate Overall Budget Limit
    const overallPercentage = (totalSpent / budget.total_limit) * 100;

    for (const threshold of thresholds) {
      if (overallPercentage >= threshold) {
        // Check if an alert for this threshold on overall budget already exists
        const alreadyTriggered = existingAlerts.some(
          (a) => a.threshold === threshold && (!a.category_id || a.category_id === null)
        );

        if (!alreadyTriggered) {
          const alert: Alert = {
            id: `alt_${budget.id}_overall_${threshold}_${Date.now()}`,
            budget_id: budget.id,
            category_id: null,
            threshold,
            triggered_at: new Date().toISOString(),
            seen: false,
          };
          await repository.saveAlert(alert);
          newAlerts.push(alert);
          existingAlerts.push(alert);
        }
      }
    }

    // 2. Evaluate Category-level Limits
    for (const line of budgetLines) {
      if (line.limit_amount > 0) {
        const catSpent = spentByCategory[line.category_id] || 0;
        const catPercentage = (catSpent / line.limit_amount) * 100;

        for (const threshold of thresholds) {
          if (catPercentage >= threshold) {
            const alreadyTriggered = existingAlerts.some(
              (a) => a.threshold === threshold && a.category_id === line.category_id
            );

            if (!alreadyTriggered) {
              const alert: Alert = {
                id: `alt_${budget.id}_cat_${line.category_id}_${threshold}_${Date.now()}`,
                budget_id: budget.id,
                category_id: line.category_id,
                threshold,
                triggered_at: new Date().toISOString(),
                seen: false,
              };
              await repository.saveAlert(alert);
              newAlerts.push(alert);
              existingAlerts.push(alert);
            }
          }
        }
      }
    }

    return newAlerts;
  }
}
