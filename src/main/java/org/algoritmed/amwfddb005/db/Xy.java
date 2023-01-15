package org.algoritmed.amwfddb005.db;

public class Xy {
    String x;

    public String getX() {
        return x;
    }

    Integer y;

    public Integer getY() {
        return y;
    }

    public String toString() {
        return String.format("Xy: {x : \"%s\", y : \"%s\"}", getX(), getY());
    }

    public Xy() {
        super();
    }

}