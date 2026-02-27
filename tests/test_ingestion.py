# tests/test_ingestion.py
import pandas as pd
import pytest

from backend.app.services.ingestion import clean_salary, clean_title, load_and_clean


def test_clean_salary_normal():
    assert clean_salary("$137K-$171K") == 154000.0


def test_clean_salary_invalid():
    assert clean_salary("Not available") is None
    assert clean_salary(None) is None


def test_clean_title_removes_rating():
    assert clean_title("Data Scientist\n3.5") == "Data Scientist"


def test_clean_title_strips_spaces():
    assert clean_title("  Data Engineer  ") == "Data Engineer"


def test_clean_title_invalid():
    assert clean_title(None) == ""


def test_load_and_clean_returns_dataframe():
    df = load_and_clean("data/raw/jobs.csv")
    assert isinstance(df, pd.DataFrame)
    assert "job_title_clean" in df.columns
    assert "salary_avg" in df.columns
    assert "description_clean" in df.columns
    assert len(df) > 0


def test_load_and_clean_no_empty_titles():
    df = load_and_clean("data/raw/jobs.csv")
    assert (df["job_title_clean"] != "").all()