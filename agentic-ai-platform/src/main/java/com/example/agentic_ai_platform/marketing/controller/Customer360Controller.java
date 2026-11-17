package com.example.agentic_ai_platform.marketing.controller;

import com.example.agentic_ai_platform.marketing.dto.*;
import com.example.agentic_ai_platform.marketing.entity.Customer360Account;
import com.example.agentic_ai_platform.marketing.repository.Customer360Repository;
import com.example.agentic_ai_platform.marketing.repository.Customer360SignalRepository;
import com.example.agentic_ai_platform.marketing.repository.Customer360OfferRepository;
import com.example.agentic_ai_platform.marketing.entity.Customer360Signal;
import com.example.agentic_ai_platform.marketing.entity.Customer360Offer;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.*;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/api/marketing/customer-360")
public class Customer360Controller {
 private final Customer360Repository repo;
 private final Customer360SignalRepository signals;
 private final Customer360OfferRepository offers;
 public Customer360Controller(Customer360Repository repo,Customer360SignalRepository signals,Customer360OfferRepository offers){this.repo=repo;this.signals=signals;this.offers=offers;}
 @GetMapping public List<Customer360Response> list(@RequestParam(required=false) String q,@RequestParam(required=false) String industry,@RequestParam(required=false) String tier,@RequestParam(required=false) String status,JwtAuthenticationToken auth){
  String query=q==null?"":q.toLowerCase(Locale.ROOT); UUID tenant=tenant(auth);
  return repo.findAllByTenantId(tenant).stream().filter(a->query.isBlank()||a.getName().toLowerCase(Locale.ROOT).contains(query)||(a.getDomain()!=null&&a.getDomain().toLowerCase(Locale.ROOT).contains(query))).filter(a->industry==null||industry.equalsIgnoreCase(a.getIndustry())).filter(a->tier==null||tier.equals(a.getTier())).filter(a->status==null||status.equals(a.getCustomerStatus())).map(Customer360Controller::response).toList();
 }
 @GetMapping("/{id}") public Customer360Response get(@PathVariable UUID id,JwtAuthenticationToken auth){return response(find(tenant(auth),id));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public Customer360Response create(@Valid @RequestBody Customer360Request request,JwtAuthenticationToken auth){return response(repo.save(new Customer360Account(UUID.randomUUID(),tenant(auth),request)));}
 @PutMapping("/{id}") public Customer360Response update(@PathVariable UUID id,@Valid @RequestBody Customer360Request request,JwtAuthenticationToken auth){Customer360Account a=find(tenant(auth),id);a.update(request);return response(repo.save(a));}
 @GetMapping("/{id}/signals") public List<Customer360Signal> signals(@PathVariable UUID id,JwtAuthenticationToken auth){UUID t=tenant(auth);find(t,id);return signals.findAllByTenantIdAndAccountIdOrderByObservedAtDesc(t,id);}
 @PostMapping("/{id}/signals") @ResponseStatus(HttpStatus.CREATED) public Customer360Signal addSignal(@PathVariable UUID id,@Valid @RequestBody Customer360SignalRequest request,JwtAuthenticationToken auth){UUID t=tenant(auth);find(t,id);return signals.save(new Customer360Signal(UUID.randomUUID(),t,id,request));}
 @GetMapping("/{id}/offers") public List<Customer360Offer> offers(@PathVariable UUID id,JwtAuthenticationToken auth){UUID t=tenant(auth);find(t,id);return offers.findAllByTenantIdAndAccountIdOrderByCreatedAtDesc(t,id);}
 @PostMapping("/{id}/offers") @ResponseStatus(HttpStatus.CREATED) public Customer360Offer addOffer(@PathVariable UUID id,@Valid @RequestBody Customer360OfferRequest request,JwtAuthenticationToken auth){UUID t=tenant(auth);find(t,id);return offers.save(new Customer360Offer(UUID.randomUUID(),t,id,request));}
 private Customer360Account find(UUID t,UUID id){return repo.findByTenantIdAndId(t,id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Customer account not found"));}
 private static Customer360Response response(Customer360Account a){BigDecimal h=a.getHealthScore(),c=a.getChurnProbability();return new Customer360Response(a.getId(),a.getName(),a.getDomain(),a.getIndustry(),a.getTier(),a.getAnnualContractValue(),a.getCurrency(),h,h==null?"UNKNOWN":h.compareTo(BigDecimal.valueOf(80))>0?"HEALTHY":h.compareTo(BigDecimal.valueOf(60))>0?"NEEDS_ATTENTION":"AT_RISK",c,c==null?"UNKNOWN":c.compareTo(BigDecimal.valueOf(60))>=0?"HIGH":c.compareTo(BigDecimal.valueOf(30))>=0?"MEDIUM":"LOW",a.getLeadScore(),a.getCustomerStatus(),a.getCreatedAt(),a.getUpdatedAt());}
 private static UUID tenant(JwtAuthenticationToken auth){try{return UUID.fromString(auth.getToken().getClaimAsString("tenant_id"));}catch(RuntimeException e){throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Token has no valid tenant_id claim");}}
}
