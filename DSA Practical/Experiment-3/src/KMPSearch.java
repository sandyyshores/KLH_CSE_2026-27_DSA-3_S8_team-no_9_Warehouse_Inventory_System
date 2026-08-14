import java.util.ArrayList;

public class KMPSearch {

    // Build LPS array
    private static int[] buildLPS(String pattern) {

        int m = pattern.length();

        int[] lps = new int[m];

        int length = 0;
        int i = 1;

        while (i < m) {

            if (pattern.charAt(i) ==
                    pattern.charAt(length)) {

                length++;

                lps[i] = length;

                i++;

            } else {

                if (length != 0) {

                    length = lps[length - 1];

                } else {

                    lps[i] = 0;

                    i++;
                }
            }
        }

        return lps;
    }

    // KMP search
    public static ArrayList<Integer> search(
            String text,
            String pattern) {

        ArrayList<Integer> positions =
                new ArrayList<>();

        int n = text.length();
        int m = pattern.length();

        if (m == 0) {
            return positions;
        }

        int[] lps = buildLPS(pattern);

        int i = 0;
        int j = 0;

        while (i < n) {

            if (text.charAt(i) ==
                    pattern.charAt(j)) {

                i++;
                j++;

                // Complete pattern found
                if (j == m) {

                    positions.add(i - j);

                    // Continue searching for
                    // overlapping occurrences
                    j = lps[j - 1];
                }

            } else {

                if (j != 0) {

                    j = lps[j - 1];

                } else {

                    i++;
                }
            }
        }

        return positions;
    }
}