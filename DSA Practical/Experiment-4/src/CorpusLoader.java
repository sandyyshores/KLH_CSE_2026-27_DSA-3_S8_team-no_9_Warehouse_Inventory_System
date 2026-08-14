import java.io.*;
import java.util.*;

public class CorpusLoader {

    public void loadCorpus(String folderPath,
                           ArticleRepository repository) {

        File folder = new File(folderPath);

        System.out.println("Looking for corpus at:");
        System.out.println(folder.getAbsolutePath());

        if (!folder.exists()) {
            System.out.println("Corpus folder not found.");
            return;
        }

        if (!folder.isDirectory()) {
            System.out.println("Corpus path is not a directory.");
            return;
        }

        File[] files = folder.listFiles();

        if (files == null) {
            System.out.println("Cannot access corpus folder.");
            return;
        }

        Arrays.sort(files);

        int id = 101;

        for (File file : files) {

            if (!file.isFile() ||
                    !file.getName().toLowerCase().endsWith(".txt")) {
                continue;
            }

            try {

                BufferedReader br =
                        new BufferedReader(
                                new FileReader(file)
                        );

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

                Article article =
                        new Article(
                                id,
                                title,
                                content.toString().trim()
                        );

                repository.add(article);

                id++;

            } catch (IOException e) {

                System.out.println(
                        "Cannot read file: " + file.getName()
                );
            }
        }
    }
}