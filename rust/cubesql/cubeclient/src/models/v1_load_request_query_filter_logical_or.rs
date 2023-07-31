/*
 * Cube.js
 *
 * Cube.js Swagger Schema
 *
 * The version of the OpenAPI document: 1.0.0
 *
 * Generated by: https://openapi-generator.tech
 */

#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize)]
pub struct V1LoadRequestQueryFilterLogicalOr {
    #[serde(rename = "or", skip_serializing_if = "Option::is_none")]
    pub or: Option<Vec<serde_json::Value>>,
}

impl V1LoadRequestQueryFilterLogicalOr {
    pub fn new() -> V1LoadRequestQueryFilterLogicalOr {
        V1LoadRequestQueryFilterLogicalOr { or: None }
    }
}
