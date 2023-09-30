export function query(queries) {
    queries = {
      ...{
        sort: 'name'
      },
      ...queries        
    };

    var str = [];
    for (const key in queries)
      if (queries.hasOwnProperty(key) && !!queries[key]) {
        str.push(encodeURIComponent(key) + "=" + encodeURIComponent(queries[key]));
      }
    return str.join("&");
}