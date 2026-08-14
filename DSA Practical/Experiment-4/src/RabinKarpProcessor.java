import java.util.ArrayList;
import java.util.Scanner;

public class RabinKarpProcessor {

    public static void main(String[] args) {

        ArticleRepository repository = new ArticleRepository();


        CorpusLoader loader = new CorpusLoader();

        loader.loadCorpus("corpus", repository);

        Scanner scanner = new Scanner(System.in);

        System.out.println("=====================================");
        System.out.println("       TEXTHACK RABIN-KARP SEARCH");
        System.out.println("=====================================");

        System.out.print("Enter keyword to search : ");

        String pattern = scanner.nextLine().trim().toLowerCase();

        System.out.println();

        System.out.println("=====================================");
        System.out.println("       RABIN-KARP PATTERN SEARCH");
        System.out.println("=====================================");
        System.out.println();

        // Search every article
        for (Article article : repository.getArticles()) {

            ArrayList<Integer> positions = RabinKarpSearch.search(article.content, pattern);

            if (!positions.isEmpty()) {

                System.out.println("Article ID : " + article.id);

                System.out.println("Title     : " + article.title);

                System.out.println();

                for (int position : positions) {

                    System.out.println("Pattern found at position : " + position);
                }

                System.out.println();

                System.out.println("Total occurrences : " + positions.size());

                System.out.println();
            }
        }

        // Document similarity
        ArrayList<Article> articles = repository.getArticles();

        if (articles.size() >= 2) {

            System.out.println();
            System.out.println("=====================================");
            System.out.println("       DOCUMENT SIMILARITY");
            System.out.println("=====================================");

            for (int i = 0; i < articles.size(); i++) {

                for (int j = i + 1; j < articles.size(); j++) {

                    DocumentSimilarity.compare(articles.get(i), articles.get(j));
                }
            }
        }
        scanner.close();
    }
}