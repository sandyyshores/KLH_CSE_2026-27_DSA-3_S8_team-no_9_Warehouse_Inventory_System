import java.util.*;

public class DocumentSimilarity {

    public static void compare(Article article1, Article article2) {

        Set<String> words1 = getWords(article1.content);

        Set<String> words2 = getWords(article2.content);

        Set<String> commonWords = new HashSet<>(words1);

        commonWords.retainAll(words2);

        System.out.println();
        System.out.println("----------------------------------------");
        System.out.println("DOCUMENT SIMILARITY");
        System.out.println("----------------------------------------");

        System.out.println("Article 1 : " + article1.title);

        System.out.println("Article 2 : " + article2.title);

        System.out.println("Common words : " + commonWords);

        System.out.println("Number of common words : " + commonWords.size());

        System.out.println("----------------------------------------");
    }

    private static Set<String> getWords(String content) {

        Set<String> words = new HashSet<>();

        String[] tokens = content.toLowerCase()
                        .replaceAll("[^a-zA-Z ]", "")
                        .split("\\s+");

        for (String word : tokens) {

            if (!word.isEmpty()) {
                words.add(word);
            }
        }
        return words;
    }
}