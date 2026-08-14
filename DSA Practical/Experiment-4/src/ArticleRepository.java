import java.util.*;

public class ArticleRepository {
    public ArrayList<Article> articles;

    public ArticleRepository() {
        articles = new ArrayList<>();
    }

    public void add(Article article) {
        articles.add(article);
    }

    public ArrayList<Article> getArticles() {
        return articles;
    }
}