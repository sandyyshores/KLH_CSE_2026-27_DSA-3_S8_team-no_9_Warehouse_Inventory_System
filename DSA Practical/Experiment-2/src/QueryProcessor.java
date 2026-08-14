import java.util.ArrayList;
import java.util.Scanner;

public class QueryProcessor {

    public static void main(String[] args) {

        // Create repository
        ArticleRepository repository =
                new ArticleRepository();

        // Create corpus loader
        CorpusLoader loader =
                new CorpusLoader();

        // Load articles
        loader.loadCorpus("Experiment-2/corpus", repository);

        // Create scanner for user input
        Scanner scanner = new Scanner(System.in);

        System.out.println("=====================================");
        System.out.println("      TEXTHACK QUERY PROCESSOR");
        System.out.println("=====================================");

        System.out.print("Enter keyword to search : ");

        String keyword = scanner.nextLine().trim();

        // Search articles
        ArrayList<Article> results =
                repository.search(keyword);

        System.out.println();
        System.out.println("Matching Articles");
        System.out.println();

        // Display results
        if (results.isEmpty()) {

            System.out.println(
                    "No articles found for keyword: " + keyword
            );

        } else {

            for (Article article : results) {
                article.display();
                System.out.println();
            }
        }

        scanner.close();
    }
}