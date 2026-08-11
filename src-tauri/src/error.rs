use thiserror::Error;

/// Actionable IPC/domain errors — never include secret material.
#[derive(Debug, Error)]
pub enum FaroError {
    #[error("{0}")]
    Message(String),
    #[error("database error")]
    Db(#[from] rusqlite::Error),
    #[error("io error")]
    Io(#[from] std::io::Error),
}

impl serde::Serialize for FaroError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type FaroResult<T> = Result<T, FaroError>;
