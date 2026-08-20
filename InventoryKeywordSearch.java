import java.util.ArrayList;
import java.util.List;


public class InventoryKeywordSearch {

   
    private static int[] buildFailureFunction(String pattern) {
        int m = pattern.length();
        int[] failure = new int[m];
        int j = 0; 

        for (int i = 1; i < m; i++) {
            while (j > 0 && pattern.charAt(i) != pattern.charAt(j)) {
                j = failure[j - 1];
            }
            if (pattern.charAt(i) == pattern.charAt(j)) {
                j++;
            }
            failure[i] = j;
        }
        return failure;
    }

   
    public static List<Integer> search(String text, String pattern) {
        List<Integer> matches = new ArrayList<>();
        if (pattern == null || text == null || pattern.isEmpty() || text.isEmpty()) {
            return matches;
        }

        String t = text.toLowerCase();
        String p = pattern.toLowerCase();

        int[] failure = buildFailureFunction(p);
        int n = t.length();
        int m = p.length();
        int j = 0; 

        for (int i = 0; i < n; i++) {
            while (j > 0 && t.charAt(i) != p.charAt(j)) {
                j = failure[j - 1];
            }
            if (t.charAt(i) == p.charAt(j)) {
                j++;
            }
            if (j == m) {
                matches.add(i - m + 1); 
                j = failure[j - 1];     
            }
        }
        return matches;
    }
    public static boolean contains(String text, String pattern) {
        return !search(text, pattern).isEmpty();
    }

    

    private List<Product> allProducts; 

    public InventoryKeywordSearch() {
        this.allProducts = new ArrayList<>();
    }

    public void addProduct(Product p) {
        allProducts.add(p);
    }

  
    public List<Product> searchByKeyword(String keyword) {
        List<Product> results = new ArrayList<>();
        for (Product p : allProducts) {
            if (contains(p.getName(), keyword)) {
                results.add(p);
            }
        }
        return results;
    }

   
    static class Product {
        private String sku;
        private String name;

        public Product(String sku, String name) {
            this.sku = sku;
            this.name = name;
        }

        public String getSku() { return sku; }
        public String getName() { return name; }
    }

   

    public static void main(String[] args) {
        InventoryKeywordSearch inventory = new InventoryKeywordSearch();
        inventory.addProduct(new Product("SKU001", "Steel Screw 5mm"));
        inventory.addProduct(new Product("SKU002", "Screwdriver Phillips"));
        inventory.addProduct(new Product("SKU003", "Hammer 16oz"));
        inventory.addProduct(new Product("SKU004", "Wood Screws Pack"));

        List<Product> matches = inventory.searchByKeyword("scr");
        System.out.println("Products matching \"scr\":");
        for (Product p : matches) {
            System.out.println("  " + p.getSku() + " - " + p.getName());
        }
    }
}
