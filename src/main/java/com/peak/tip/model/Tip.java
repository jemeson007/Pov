package com.peak.tip.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Version;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Tip {
	
	private @Id @GeneratedValue Long id;
	private String serv;
	private String servNumber;
	private String firstName;
	private String lastName;
	private String address;
	private String f1;
	private @Version @JsonIgnore Long version;
	public Tip(Long id, String serv, String servNumber, String firstName, String lastName, String address, String f1,
			Long version) {
		super();
		this.id = id;
		this.serv = serv;
		this.servNumber = servNumber;
		this.firstName = firstName;
		this.lastName = lastName;
		this.address = address;
		this.f1 = f1;
		this.version = version;
	}
	public Tip() {
		super();
		// TODO Auto-generated constructor stub
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getServ() {
		return serv;
	}
	public void setServ(String serv) {
		this.serv = serv;
	}
	public String getServNumber() {
		return servNumber;
	}
	public void setServNumber(String servNumber) {
		this.servNumber = servNumber;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getF1() {
		return f1;
	}
	public void setF1(String f1) {
		this.f1 = f1;
	}
	public Long getVersion() {
		return version;
	}
	public void setVersion(Long version) {
		this.version = version;
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((address == null) ? 0 : address.hashCode());
		result = prime * result + ((f1 == null) ? 0 : f1.hashCode());
		result = prime * result + ((firstName == null) ? 0 : firstName.hashCode());
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		result = prime * result + ((lastName == null) ? 0 : lastName.hashCode());
		result = prime * result + ((serv == null) ? 0 : serv.hashCode());
		result = prime * result + ((servNumber == null) ? 0 : servNumber.hashCode());
		result = prime * result + ((version == null) ? 0 : version.hashCode());
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Tip other = (Tip) obj;
		if (address == null) {
			if (other.address != null)
				return false;
		} else if (!address.equals(other.address))
			return false;
		if (f1 == null) {
			if (other.f1 != null)
				return false;
		} else if (!f1.equals(other.f1))
			return false;
		if (firstName == null) {
			if (other.firstName != null)
				return false;
		} else if (!firstName.equals(other.firstName))
			return false;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		if (lastName == null) {
			if (other.lastName != null)
				return false;
		} else if (!lastName.equals(other.lastName))
			return false;
		if (serv == null) {
			if (other.serv != null)
				return false;
		} else if (!serv.equals(other.serv))
			return false;
		if (servNumber == null) {
			if (other.servNumber != null)
				return false;
		} else if (!servNumber.equals(other.servNumber))
			return false;
		if (version == null) {
			if (other.version != null)
				return false;
		} else if (!version.equals(other.version))
			return false;
		return true;
	}
	@Override
	public String toString() {
		return "Tip [id=" + id + ", serv=" + serv + ", servNumber=" + servNumber + ", firstName=" + firstName
				+ ", lastName=" + lastName + ", address=" + address + ", f1=" + f1 + ", version=" + version + "]";
	}
	
	
}
