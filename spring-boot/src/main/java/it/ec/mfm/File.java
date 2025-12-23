package it.ec.mfm;

import java.math.BigInteger;
import java.util.Date;

public class File {

    private Integer id;
    private String name;
    private BigInteger size;
    private String type;
    private Date lastModifiedDate;
    private Boolean isFolder;

    File(Integer id, String name, BigInteger size, String type, Date lastModifiedDate, Boolean isFolder) {
        this.id = id;
        this.name = name;
        this.size = size;
        this.type = type;
        this.lastModifiedDate = lastModifiedDate;
        this.isFolder = isFolder;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigInteger getSize() {
        return size;
    }

    public void setSize(BigInteger size) {
        this.size = size;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Date getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(Date lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public Boolean getFolder() {
        return isFolder;
    }

    public void setFolder(Boolean folder) {
        isFolder = folder;
    }

    public Boolean getIsFolder() {
        return isFolder;
    }

    public void setIsFolder(Boolean folder) {
        isFolder = folder;
    }

}
