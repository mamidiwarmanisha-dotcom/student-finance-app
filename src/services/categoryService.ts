import type { Category } from '../types/models';
import { repository } from '../data/localStorageRepository';

// Keyword dictionary for instant rule-based auto-suggestion
const KEYWORD_MAP: Record<string, string[]> = {
  cat_food: [
    'food', 'lunch', 'dinner', 'breakfast', 'snack', 'coffee', 'tea', 'cafe',
    'burger', 'pizza', 'biryani', 'swiggy', 'zomato', 'canteen', 'groceries',
    'fruit', 'milk', 'mcdonald', 'starbucks', 'subway', 'dominos', 'kfc'
  ],
  cat_transport: [
    'transport', 'bus', 'train', 'metro', 'auto', 'rickshaw', 'cab', 'uber',
    'ola', 'rapido', 'petrol', 'diesel', 'fuel', 'ticket', 'flight', 'fare'
  ],
  cat_rent: [
    'rent', 'hostel', 'pg', 'room', 'flat', 'deposit', 'landlord', 'electricity',
    'maintenance', 'water bill', 'wifi', 'broadband'
  ],
  cat_fees: [
    'fee', 'fees', 'college', 'tuition', 'semester', 'exam', 'course',
    'admission', 'fine', 'library fine', 'id card', 'certification'
  ],
  cat_books: [
    'book', 'books', 'stationery', 'pen', 'pencil', 'notebook', 'xerox',
    'photocopy', 'print', 'binding', 'calculator', 'notes', 'study'
  ],
  cat_fun: [
    'fun', 'movie', 'cinema', 'game', 'party', 'outing', 'hangout', 'trip',
    'netflix', 'spotify', 'prime', 'concert', 'club', 'celebration', 'birthday'
  ],
};

export class CategoryService {
  /**
   * Fetches all available categories from the repository.
   */
  static async getCategories(): Promise<Category[]> {
    return repository.getCategories();
  }

  /**
   * Auto-suggests a category ID based on note keywords.
   * Returns category_id if a matching keyword is found, or null otherwise.
   */
  static suggestCategoryByNote(note: string): string | null {
    if (!note || note.trim().length < 2) return null;
    const lower = note.toLowerCase().trim();

    for (const [categoryId, keywords] of Object.entries(KEYWORD_MAP)) {
      for (const kw of keywords) {
        // Match word boundaries or substring
        if (lower.includes(kw)) {
          return categoryId;
        }
      }
    }

    return null;
  }
}
