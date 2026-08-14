import java.util.ArrayList;

public class RabinKarpSearch {

    private static final int PRIME = 101;

    private static final int BASE = 256;

    public static ArrayList<Integer> search(String text, String pattern) {

        ArrayList<Integer> positions = new ArrayList<>();

        text = text.toLowerCase();
        pattern = pattern.toLowerCase();

        int n = text.length();
        int m = pattern.length();

        if (m == 0 || m > n) {
            return positions;
        }

        int patternHash = 0;
        int textHash = 0;

        int highPower = 1;

        for (int i = 0; i < m - 1; i++) {
            highPower = (highPower * BASE) % PRIME;
        }


        for (int i = 0; i < m; i++) {

            patternHash = (BASE * patternHash + pattern.charAt(i)) % PRIME;

            textHash = (BASE * textHash + text.charAt(i)) % PRIME;
        }

        for (int i = 0; i <= n - m; i++) {

            if (patternHash == textHash) {

                boolean match = true;

                for (int j = 0; j < m; j++) {

                    if (text.charAt(i + j) != pattern.charAt(j)) {

                        match = false;
                        break;
                    }
                }

                if (match) {
                    positions.add(i);
                }
            }

            if (i < n - m) {

                textHash = (BASE * (textHash - text.charAt(i) * highPower) + text.charAt(i + m)) % PRIME;

                if (textHash < 0) {
                    textHash += PRIME;
                }
            }
        }
        return positions;
    }
}