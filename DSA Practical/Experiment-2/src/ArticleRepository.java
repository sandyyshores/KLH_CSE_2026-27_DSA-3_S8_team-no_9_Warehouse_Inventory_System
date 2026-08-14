import java.util.ArrayList;

public class ArticleRepository {
    public ArrayList<Article> articles;

    public ArticleRepository() {
        articles = new ArrayList<>();
    }

    public void addArticle(Article article) {
        articles.add(article);
    }

    public ArrayList<Article> search(String keyword) {
        ArrayList<Article> results = new ArrayList<>();

        keyword = keyword.toLowerCase();

        for (Article article : articles) {
            if (article.title.toLowerCase().contains(keyword) || article.content.toLowerCase().contains(keyword)) {
                results.add(article);
            }
        }

        return results;
    }
}
