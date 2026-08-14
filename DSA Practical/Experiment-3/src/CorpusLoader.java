import java.io.*;
import java.util.*;

public class CorpusLoader {

    public void loadCorpus(String folderPath,
                           ArticleRepository repository) {

        File folder = new File(folderPath);

        File[] files = folder.listFiles();

        if (files == null) {
            System.out.println("Corpus folder not found.");
            return;
        }

        // Sort files: a1, a2, a3
        Arrays.sort(files);

        int id = 101;

        for (File file : files) {

            if (!file.getName().endsWith(".txt")) {
                continue;
            }

            try {

                BufferedReader br =
                        new BufferedReader(new FileReader(file));

                // First line = title
                String title = br.readLine();

                // Skip blank line
                br.readLine();

                StringBuilder content =
                        new StringBuilder();

                String line;

                while ((line = br.readLine()) != null) {

                    if (!line.trim().isEmpty()) {
                        content.append(line).append(" ");
                    }
                }

                br.close();

                Article article = new Article(
                        id,
                        title,
                        content.toString().trim()
                );

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