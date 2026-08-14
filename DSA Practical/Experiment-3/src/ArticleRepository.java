import java.util.ArrayList;

public class ArticleRepository {

    private ArrayList<Article> articles;

    public ArticleRepository() {
        articles = new ArrayList<>();
    }

    public void addArticle(Article article) {
        articles.add(article);
    }

    public ArrayList<Article> getArticles() {
        return articles;
    }
}