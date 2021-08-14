<?php
error_reporting(0);

$DATA_FILE = './data/movies.json';
$PAGE_LIMIT = 10;
$CURRENT_PAGE = getCurrentPage();
$SEARCH_QUERY = getSearchQuery();

if ($SEARCH_QUERY !== null) {
    searchMovie($DATA_FILE, $PAGE_LIMIT, $SEARCH_QUERY);
} else {
    getMovies($DATA_FILE, $PAGE_LIMIT, $CURRENT_PAGE);
}

function searchMovie($DATA_FILE, $PAGE_LIMIT, $SEARCH_QUERY)
{
    try {
        $file = fopen($DATA_FILE, 'r') or throw new Error("Cannot read file");
        $fileSize = filesize($DATA_FILE);

        $moviesStr =  fread($file, $fileSize);

        $moviesArray = json_decode($moviesStr);

        $exp = "/$SEARCH_QUERY/i";
        $matches = array();
        $scores = array();

        for ($i = 0; $i < count($moviesArray); $i++) {
            $score = 0;
            $score += 5 * preg_match($exp, $moviesArray[$i]->title);
            $score += 3 * preg_match($exp, $moviesArray[$i]->originalTitle);
            $score += 1 * preg_match($exp, $moviesArray[$i]->storyline);

            if ($score > 0) {
                $matches[] = $moviesArray[$i];
                $scores[] = $score;
            }
        }

        for ($i = 0; $i < count($matches); $i++) {
            for ($j = 0; $j < count($matches); $j++) {
                if ($scores[$j] > $scores[$i]) {
                    $scorePlaceHolder = $scores[$i];
                    $scores[$i] = $scores[$j];
                    $scores[$j] = $scorePlaceHolder;

                    $moviePlaceholder = $matches[$i];
                    $matches[$i] = $matches[$j];
                    $matches[$j] = $moviePlaceholder;
                }
            }
        }

        $bestMatches = array_slice($matches, 0, $PAGE_LIMIT);
        echo json_encode($bestMatches);
        fclose($file);
    } catch (Exception $e) {
        echo $e;
    }
}

function getMovies($DATA_FILE, $PAGE_LIMIT, $CURRENT_PAGE)
{
    try {
        $file = fopen($DATA_FILE, 'r') or throw new Error("Cannot read file");
        $fileSize = filesize($DATA_FILE);

        $moviesStr =  fread($file, $fileSize);

        $moviesArray = json_decode($moviesStr);

        $offset = ($CURRENT_PAGE - 1) * $PAGE_LIMIT;
        $returnMovies = array_slice($moviesArray, $offset, $PAGE_LIMIT);
        echo json_encode($returnMovies);

        fclose($file);
    } catch (Exception $e) {
        echo $e;
    }
}

function getCurrentPage()
{
    try {
        parse_str($_SERVER['QUERY_STRING'], $PARAMS);
        return array_key_exists('p', $PARAMS) ? $PARAMS['p'] : 1;
    } catch (Exception $e) {
        return 1;
    }
}

function getSearchQuery()
{
    try {
        parse_str($_SERVER['QUERY_STRING'], $PARAMS);
        return array_key_exists('s', $PARAMS) ? $PARAMS['s'] : null;
    } catch (Exception $e) {
        return null;
    }
}
