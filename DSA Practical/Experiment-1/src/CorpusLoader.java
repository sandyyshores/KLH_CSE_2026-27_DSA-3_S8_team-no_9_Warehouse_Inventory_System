import java.io.*;
import java.util.*;

public class CorpusLoader {

    public static void main(String[] args) {

        ArrayList<Article> repository = new ArrayList<>();

        String[] files = {"a1.txt", "a2.txt"};

        int id = 101;
        int totalWords = 0;

        for (String fileName : files) {

            try {

                File file = new File("Experiment-1/corpus/" + fileName);

                System.out.println("Reading file: " + file.getAbsolutePath());

                BufferedReader br = new BufferedReader(new FileReader(file));

                String title = br.readLine();

                br.readLine();

                StringBuilder content = new StringBuilder();

                String line;

                while ((line = br.readLine()) != null) {

                    if (!line.trim().isEmpty()) {
                        content.append(line).append(" ");
                    }
                }

                br.close();

                String finalContent = content.toString().trim();

                Article article = new Article(id, title, finalContent);

                repository.add(article);

                totalWords += article.wordCount;

                id++;

            } catch (IOException e) {

                System.out.println(
                        "Cannot read file: " + fileName
                );

                e.printStackTrace();
            }
        }

        // Display Repository
        System.out.println();
        System.out.println("======================================");
        System.out.println("      TEXTHACK ARTICLE REPOSITORY");
        System.out.println("======================================");
        System.out.println();

        for (Article article : repository) {
            article.display();
        }

        // Repository statistics
        System.out.println("Repository Statistics");
        System.out.println("----------------------");
        System.out.println(
                "Total Articles Loaded : " + repository.size()
        );
        System.out.println(
                "Total Words           : " + totalWords
        );
    }
}