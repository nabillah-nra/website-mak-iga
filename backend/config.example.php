<?php
// Copy to config.php and set credentials in your local environment.
return [
    "db_host" => getenv("DB_HOST") ?: "127.0.0.1",
    "db_name" => getenv("DB_NAME") ?: "makig_smartcost",
    "db_user" => getenv("DB_USER") ?: "root",
    "db_pass" => getenv("DB_PASS") ?: "",
    "openai_api_key" => getenv("OPENAI_API_KEY") ?: "",
    "openai_model" => getenv("OPENAI_MODEL") ?: "gpt-5.4-mini",
];
