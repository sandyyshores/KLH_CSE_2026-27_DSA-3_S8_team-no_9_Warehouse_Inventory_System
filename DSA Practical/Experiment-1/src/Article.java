public class Article {

    int id;
    String title;
    String content;
    int wordCount;

    public Article(int id, String title, String content) {

        this.id = id;
        this.title = title;
        this.content = content;

        // Count words in the content
        if (content == null || content.trim().isEmpty()) {
            this.wordCount = 0;
        } else {
            this.wordCount = content.trim().split("\\s+").length;
        }
    }

    public void display() {

        System.out.println("-------------------------------------------");
        System.out.println("Article ID : " + id);
        System.out.println("Title      : " + title);
        System.out.println("Word Count : " + wordCount);
        System.out.println("Content    : ");
        System.out.println(content);
        System.out.println("-------------------------------------------");
        System.out.println();
    }
}