Exercise

Create a widget (HTML, CSS, JS) which is an input with rich autosuggest/autocomplete functionality.
 Example of L&F: https://jqueryui.com/autocomplete/#multiple

Parts:
1) JSON file with words and weights, e.g. {“bread”: 10, “alfabet”: 5}, with 200 entries (grab somewhere or generate it please). Entries could be multiwords, e.g. {“red apple”: 50}.
2) HTML input and submit button near it.
3) Dialog element with dynamically appearing suggested items (words) (hidden at start).
4) JS module with selected (by user) entries.

Behaviour:
 - widget parameters: input class, submit class, dialog class, JSON file source
 - when the user types more than 2 letters the widget should suggest up to 8 best elements by weight. If user pick one element, element’s word is added to input text
 - suggesting dialog should appear right below the cursor
 - after whitespace entered and 1 new letter entered widget should suggest new 8 best items for the 1 letter entered and all previous words also. E.g. user types “red a”, widget should suggest “apple”, “red apple corporation”, “angle”, “red angel” where all these phrases are in JSON file with weights, after second letter adding new suggested items should be shown
 - on submit click widget should send selected entries (word+weight) by AJAX to server.
