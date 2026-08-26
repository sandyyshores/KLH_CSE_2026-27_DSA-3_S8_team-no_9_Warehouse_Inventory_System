public class SimilarityScorer {

    public static double levenshteinSimilarity(String a, String b) {
        int distance = FuzzySearch.levenshteinDistance(a, b);
        int maxLen = Math.max(a.length(), b.length());
        if (maxLen == 0) return 1.0;
        return 1.0 - ((double) distance / maxLen);
    }

    public static double jaccardSimilarity(String a, String b) {
        Set<Character> setA = new HashSet<>();
        for (char c : a.toCharArray()) setA.add(c);
        Set<Character> setB = new HashSet<>();
        for (char c : b.toCharArray()) setB.add(c);

        Set<Character> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);

        Set<Character> union = new HashSet<>(setA);
        union.addAll(setB);

        if (union.isEmpty()) return 1.0;
        return (double) intersection.size() / union.size();
    }

    public static List<Map.Entry<String, Double>> rankBySimilarity(String query, List<String> candidates) {
        List<Map.Entry<String, Double>> ranked = new ArrayList<>();
        for (String candidate : candidates) {
            double score = levenshteinSimilarity(query.toLowerCase(), candidate.toLowerCase());
            ranked.add(new AbstractMap.SimpleEntry<>(candidate, score));
        }
        ranked.sort((x, y) -> Double.compare(y.getValue(), x.getValue()));
        return ranked;
    }
}