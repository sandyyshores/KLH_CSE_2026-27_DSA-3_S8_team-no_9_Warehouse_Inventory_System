import java.util.ArrayList;

public class NaiveSearch {

    public static ArrayList<Integer> search(
            String text,
            String pattern) {

        ArrayList<Integer> positions =
                new ArrayList<>();

        int n = text.length();
        int m = pattern.length();

        // Check every possible position
        for (int i = 0; i <= n - m; i++) {

            int j = 0;

            // Compare pattern with text
            while (j < m &&
                    text.charAt(i + j) == pattern.charAt(j)) {

                j++;
            }

            // Pattern completely matched
            if (j == m) {
                positions.add(i);
            }
        }

        return positions;
    }
}