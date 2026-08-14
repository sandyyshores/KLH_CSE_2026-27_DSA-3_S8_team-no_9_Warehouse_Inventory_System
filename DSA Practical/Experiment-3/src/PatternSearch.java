import java.util.ArrayList;
import java.util.Scanner;

public class PatternSearch {

    public static void main(String[] args) {

        // Create repository
        ArticleRepository repository =
                new ArticleRepository();

        // Load corpus
        CorpusLoader loader =
                new CorpusLoader();

        loader.loadCorpus("corpus", repository);

        Scanner scanner =
                new Scanner(System.in);

        System.out.println("=====================================");
        System.out.println("       TEXTHACK PATTERN SEARCH");
        System.out.println("=====================================");

        System.out.print("Enter keyword to search : ");

        String pattern =
                scanner.nextLine().trim();

        // Convert to lowercase for
        // case-insensitive searching
        pattern = pattern.toLowerCase();

        /*
         * NAIVE PATTERN MATCHING
         */

        System.out.println();
        System.out.println("=====================================");
        System.out.println("       NAIVE PATTERN MATCHING");
        System.out.println("=====================================");
        System.out.println();

        for (Article article :
                repository.getArticles()) {

            String text =
                    article.content.toLowerCase();

            ArrayList<Integer> positions =
                    NaiveSearch.search(text, pattern);

            if (!positions.isEmpty()) {

                System.out.println(
                        "Article ID : " + article.id
                );

                System.out.println(
                        "Title     : " + article.title
                );

                System.out.println();

                for (int position : positions) {

                    System.out.println(
                            "Pattern found at position : "
                                    + position
                    );
                }

                System.out.println();

                System.out.println(
                        "Total occurrences : "
                                + positions.size()
                );

                System.out.println();
            }
        }

        /*
         * KMP PATTERN MATCHING
         */

        System.out.println();
        System.out.println("=====================================");
        System.out.println("       KMP PATTERN MATCHING");
        System.out.println("=====================================");
        System.out.println();

        for (Article article :
                repository.getArticles()) {

            String text =
                    article.content.toLowerCase();

            ArrayList<Integer> positions =
                    KMPSearch.search(text, pattern);

            if (!positions.isEmpty()) {

                System.out.println(
                        "Article ID : " + article.id
                );

                System.out.println(
                        "Title     : " + article.title
                );

                System.out.println();

                for (int position : positions) {

                    System.out.println(
                            "Pattern found at position : "
                                    + position
                    );
                }

                System.out.println();

                System.out.println(
                        "Total occurrences : "
                                + positions.size()
                );

                System.out.println();
            }
        }

        scanner.close();
    }
}