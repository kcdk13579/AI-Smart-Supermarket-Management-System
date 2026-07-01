package com.supermarket.auth.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String role; // ROLE_ADMIN, ROLE_CUSTOMER

    /**
     * All trolleys ever associated with this customer.
     */
    @OneToMany(mappedBy = "customer")
    private List<Trolley> trolleys = new ArrayList<>();

    /**
     * All sales made by this customer.
     */
    @OneToMany(mappedBy = "customer")
    private List<Sale> sales = new ArrayList<>();

    public User() {}

    public User(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getRole() { return role; }
    public List<Trolley> getTrolleys() { return trolleys; }
    public List<Sale> getSales() { return sales; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(String role) { this.role = role; }
    public void setTrolleys(List<Trolley> trolleys) { this.trolleys = trolleys; }
    public void setSales(List<Sale> sales) { this.sales = sales; }
}
