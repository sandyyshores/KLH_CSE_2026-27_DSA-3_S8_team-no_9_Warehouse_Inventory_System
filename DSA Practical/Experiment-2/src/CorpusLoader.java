import java.io.*;
import java.util.*;

public class CorpusLoader {

    public void loadCorpus(String folderPath, ArticleRepository repository) {

        File folder = new File(folderPath);

        File[] files = folder.listFiles();

        if (files == null) {
            System.out.println("Corpus folder not found.");
            return;
        }

        // Sort files so that a1, a2, a3 are loaded in order
        Arrays.sort(files);

        int id = 101;

        for (File file : files) {

            if (!file.getName().endsWith(".txt")) {
                continue;
            }

            try {

                BufferedReader br =
                        new BufferedReader(new FileReader(file));

                // Read title
                String title = br.readLine();

                // Skip blank line
                br.readLine();

                // Read content
                StringBuilder content = new StringBuilder();

                String line;

                while ((line = br.readLine()) != null) {

                    if (!line.trim().isEmpty()) {
                        content.append(line).append(" ");
                    }
                }

                br.close();

                // Create Article object
                Article article = new Article(
                        id,
                        title,
                        content.toString().trim()
                );

                // Store article
                repository.addArticle(article);

                id++;

            } catch (IOException e) {

                System.out.println(
                        "Cannot read file : " + file.getName()
                );
            }
        }
    }
}